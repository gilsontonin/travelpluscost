#!/usr/bin/env node
// embed-related.mjs — write content/blog-related.json mapping each post slug to its most
// content-similar neighbors. Uses GEMINI EMBEDDINGS (gemini-embedding-001, SEMANTIC_SIMILARITY,
// 768-dim) when GEMINI_API_KEY is set — the real semantic vectors — and falls back to local TF-IDF
// with no key (so it never breaks the build). The blog render prefers this file.
//   npm run blog:related     # = node --env-file=.env.local scripts/blog/embed-related.mjs
import fs from "node:fs";

const N = 8;
const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const posts = [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?title:\s*\n?\s*"((?:[^"\\]|\\.)*)"[\s\S]*?body:\s*`([\s\S]*?)`,\s*\n\s*\},/g)]
  .map((m) => ({ slug: m[1], title: m[2], body: m[3] }));
if (!posts.length) { console.error("No posts parsed from src/lib/posts.ts"); process.exit(1); }

const clean = (b) =>
  b.replace(/^::\w+.*$/gm, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[[^\]]*\]\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
const textFor = (p) => `${p.title}\n\n${clean(p.body)}`.slice(0, 8000);

const KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-embedding-001";
const DIM = 768;

async function geminiEmbed(text) {
  const body = { content: { parts: [{ text }] }, taskType: "SEMANTIC_SIMILARITY", outputDimensionality: DIM };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${KEY}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Gemini embed ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).embedding.values;
}

const STOP = new Set(
  ("the a an and or of to in on for with at by from is are was were be been being this that these those it its as your you we our us they their then than so but if not no do does did has have had will would can could should may one two more most some any all each into out up down over under about here there what when where which who why how best very just like get got also only same").split(/\s+/),
);
const tokens = (t) => clean(t).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

function dot(a, b) { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d; }
function cosArr(a, b) { return dot(a, b) / (Math.sqrt(dot(a, a)) * Math.sqrt(dot(b, b)) || 1); }

async function neighbors() {
  if (KEY) {
    const vecs = [];
    const CONC = 8;
    for (let i = 0; i < posts.length; i += CONC) {
      const chunk = posts.slice(i, i + CONC);
      const e = await Promise.all(chunk.map((p) => geminiEmbed(textFor(p))));
      e.forEach((v, k) => (vecs[i + k] = v));
      console.error(`embedded ${Math.min(i + CONC, posts.length)}/${posts.length} (gemini ${MODEL}, ${DIM}d)`);
    }
    return (i) => posts.map((p, j) => ({ slug: p.slug, s: j === i ? -1 : cosArr(vecs[i], vecs[j]) }));
  }
  // TF-IDF fallback
  console.error(`no GEMINI_API_KEY — using local TF-IDF fallback`);
  const docs = posts.map((p) => { const m = new Map(); for (const t of tokens(`${p.title} ${p.body}`)) m.set(t, (m.get(t) || 0) + 1); return m; });
  const df = new Map();
  for (const d of docs) for (const t of d.keys()) df.set(t, (df.get(t) || 0) + 1);
  const idf = (t) => Math.log((docs.length + 1) / ((df.get(t) || 0) + 1)) + 1;
  const vecs = docs.map((d) => { const v = new Map(); for (const [t, c] of d) v.set(t, c * idf(t)); return v; });
  const norm = (v) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
  const cos = (a, b) => { let d = 0; for (const [t, w] of a) d += w * (b.get(t) || 0); return d / (norm(a) * norm(b)); };
  return (i) => posts.map((p, j) => ({ slug: p.slug, s: j === i ? -1 : cos(vecs[i], vecs[j]) }));
}

const simRow = await neighbors();
const out = {};
for (let i = 0; i < posts.length; i++) {
  out[posts[i].slug] = simRow(i)
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, N)
    .map((x) => x.slug);
}

fs.mkdirSync("content", { recursive: true });
fs.writeFileSync("content/blog-related.json", JSON.stringify(out, null, 2) + "\n");
const counts = Object.entries(out).map(([s, r]) => `${s}:${r.length}`).join(" · ");
console.log(`Wrote content/blog-related.json — ${posts.length} post(s) via ${KEY ? "Gemini" : "TF-IDF"} [${counts}]`);
