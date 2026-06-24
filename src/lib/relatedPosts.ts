// Content-similarity "related guides" — TF-IDF cosine over post bodies, NO API key (a local,
// deterministic stand-in for the Hawaii system's Gemini embeddings). Used to render "Related guides"
// by RELEVANCE, never chronologically. The build artifact `content/blog-related.json` is written by
// scripts/blog/embed-related.mjs using the same idea; this computes live so it's always in sync.
import { POSTS, type Post } from "./posts";
import relatedJson from "../../content/blog-related.json";

// Prefer the precomputed neighbors from `npm run blog:related` (Gemini embeddings when GEMINI_API_KEY
// is set, else TF-IDF). Falls back to the live TF-IDF below if a slug is missing/empty there.
const PRECOMPUTED = relatedJson as Record<string, string[]>;

const STOP = new Set(
  ("the a an and or of to in on for with at by from is are was were be been being this that these those it its as " +
    "your you we our us they their he she his her them then than so but if not no yes do does did has have had will " +
    "would can could should may might one two more most some any all each per into out up down over under about " +
    "here there what when where which who why how most best more very just like get got also only same most")
    .split(/\s+/),
);

function tokens(p: Post): string[] {
  return `${p.title} ${p.body}`
    .toLowerCase()
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ") // drop link URLs
    .replace(/::\w+[^\n]*/g, " ") // drop directives
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function tf(toks: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of toks) m.set(t, (m.get(t) || 0) + 1);
  return m;
}

/** Top-N most content-similar post slugs to `slug` (descending similarity). */
export function relatedSlugs(slug: string, n = 8): string[] {
  const pre = PRECOMPUTED[slug];
  if (pre && pre.length) return pre.slice(0, n);
  const docs = POSTS.map((p) => ({ slug: p.slug, tf: tf(tokens(p)) }));
  if (docs.length < 2) return [];
  // idf
  const df = new Map<string, number>();
  for (const d of docs) for (const term of d.tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  const N = docs.length;
  const idf = (t: string) => Math.log((N + 1) / ((df.get(t) || 0) + 1)) + 1;
  // tf-idf vectors + norms
  const vec = (d: { tf: Map<string, number> }) => {
    const v = new Map<string, number>();
    for (const [t, c] of d.tf) v.set(t, c * idf(t));
    return v;
  };
  const norm = (v: Map<string, number>) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
  const vectors = docs.map((d) => ({ slug: d.slug, v: vec(d) }));
  const target = vectors.find((x) => x.slug === slug);
  if (!target) return [];
  const tn = norm(target.v);
  const sims = vectors
    .filter((x) => x.slug !== slug)
    .map((x) => {
      let dot = 0;
      const [small, big] = target.v.size < x.v.size ? [target.v, x.v] : [x.v, target.v];
      for (const [t, w] of small) dot += w * (big.get(t) || 0);
      return { slug: x.slug, sim: dot / (tn * norm(x.v)) };
    })
    .filter((x) => x.sim > 0)
    .sort((a, b) => b.sim - a.sim);
  return sims.slice(0, n).map((x) => x.slug);
}
