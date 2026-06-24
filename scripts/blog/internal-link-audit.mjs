// internal-link-audit.mjs — the internal-link graph for the /internal-linking skill. Read-only: it
// tells the skill WHAT to link; Claude makes the semantic call and writes natural-anchor links.
// Self-contained (parses src/lib/posts.ts). Budget ~1 internal link / 450w, clamped [2,9] per post.
//   node scripts/blog/internal-link-audit.mjs            # global health: orphans + under-budget
//   node scripts/blog/internal-link-audit.mjs --page <slug>
import fs from "node:fs";

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const posts = [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?body:\s*`([\s\S]*?)`,\s*\n\s*\},/g)].map((m) => {
  const slug = m[1], body = m[2];
  const words = body.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").split(/\s+/).filter(Boolean).length;
  // every internal link target in the body
  const out = [...body.matchAll(/\]\((\/(?:hotels|destinations|search|blog|about|disclosure|#)[^)]*)\)/g)].map((x) => x[1]);
  // which other POSTS this one links to (for the orphan graph)
  const outPosts = new Set([...body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\/?\)/g)].map((x) => x[1]));
  return { slug, url: `/blog/${slug}`, words, out, outPosts };
});
const bySlug = new Map(posts.map((p) => [p.slug, p]));
// inbound = posts that link TO this one
for (const p of posts) p.inbound = posts.filter((q) => q.slug !== p.slug && q.outPosts.has(p.slug)).map((q) => q.slug);

const budget = (p) => Math.min(Math.max(Math.round(p.words / 450), 2), 9);
const sharedWords = (a, b) => {
  // crude topical overlap by slug tokens (good enough to suggest a related adopter)
  const ta = new Set(a.slug.split("-")), tb = new Set(b.slug.split("-"));
  return [...ta].filter((t) => tb.has(t) && t.length > 3);
};
const bestAdopter = (orphan) =>
  posts.filter((q) => q.slug !== orphan.slug && !q.outPosts.has(orphan.slug))
    .map((q) => ({ q, s: sharedWords(orphan, q).length }))
    .sort((a, b) => b.s - a.s)[0]?.q || null;

const pageArg = process.argv.includes("--page") ? process.argv[process.argv.indexOf("--page") + 1] : null;
if (pageArg) {
  const p = bySlug.get(pageArg);
  if (!p) { console.error(`no post: ${pageArg}`); process.exit(1); }
  console.log(`\nPAGE ${p.url}  (${p.words} words)`);
  console.log(`  budget ~${budget(p)} internal links · has ${p.out.length} (${p.out.length < budget(p) ? `add ${budget(p) - p.out.length}` : "ok"})`);
  console.log(`  links out to: ${p.out.join(", ") || "—"}`);
  console.log(`  inbound from posts: ${p.inbound.join(", ") || "0 — ORPHAN"}`);
  if (!p.inbound.length) { const a = bestAdopter(p); console.log(`  → wire an inbound link FROM ${a ? a.url : "a city hub / related post"}`); }
  process.exit(0);
}

const orphans = posts.filter((p) => p.inbound.length === 0);
const under = posts.filter((p) => p.out.length < budget(p));
console.log(`INTERNAL-LINK AUDIT — ${posts.length} post(s)`);
console.log(`internal links: ${posts.reduce((n, p) => n + p.out.length, 0)} · orphans: ${orphans.length} · under-budget: ${under.length}\n`);
console.log("ORPHANS (no other post links here — wire an inbound link):");
console.log(orphans.length ? orphans.map((o) => { const a = bestAdopter(o); return `  ${o.url}  <-- from ${a ? a.url : "(a city hub)"}`; }).join("\n") : "  none ✓");
console.log("\nUNDER BUDGET (fewer than ~1/450w internal links):");
console.log(under.length ? under.map((p) => `  ${p.url}  words ${p.words} · has ${p.out.length} · target ${budget(p)}`).join("\n") : "  none ✓");
console.log(`\nNext: add genuine, natural-anchor links (route to other posts / city hubs / search). Re-run; orphans → 0.`);
