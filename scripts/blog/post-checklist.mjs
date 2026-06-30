#!/usr/bin/env node
// post-checklist.mjs — prints References/BlogPostChecklist.md as a LIVE table for one travelpluscost
// post. ✅/❌ rows are AUTO-verified from src/lib/posts.ts (the Post fields + Markdown body) + the
// generated content/blog-related.json + the infographics registry; 👁 rows need human judgment.
// Source-based (not built-HTML): the blog route auto-emits BlogPosting+FAQPage+BreadcrumbList JSON-LD
// from the Post fields, so schema is guaranteed by construction. Exit 1 if any AUTO row fails (a gate).
//
//   node scripts/blog/post-checklist.mjs <slug> [--kw "primary keyword"]
import fs from "node:fs";

const slug = process.argv[2];
const kwIdx = process.argv.indexOf("--kw");
const kw = kwIdx > -1 ? (process.argv[kwIdx + 1] || "").toLowerCase() : "";
if (!slug) { console.error('usage: post-checklist.mjs <slug> [--kw "primary keyword"]'); process.exit(1); }

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const at = src.indexOf(`slug: "${slug}"`);
if (at < 0) { console.error("slug not found:", slug); process.exit(1); }
// Body = from `body: \`` to its closing `\`,` (post bodies contain no backticks — same assumption as
// the other robots). Meta = everything in this post object before the body (holds title/desc/tldr/etc.).
const bodyStart = src.indexOf("body: `", at);
const bodyEnd = bodyStart >= 0 ? src.indexOf("`,", bodyStart + 7) : -1;
const body = bodyStart >= 0 && bodyEnd >= 0 ? src.slice(bodyStart + 7, bodyEnd) : "";
const meta = src.slice(at, bodyStart >= 0 ? bodyStart : at);
const field = (name) => { const m = meta.match(new RegExp(name + String.raw`:\s*\n?\s*"((?:[^"\\]|\\.)*)"`)); return m ? m[1] : ""; };

const title = field("title"), seoTitle = field("seoTitle"), desc = field("description"), excerpt = field("excerpt");
const coverAlt = (meta.match(/cover:\s*\{[\s\S]*?alt:\s*\n?\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || "";
const words = body.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").split(/\s+/).filter(Boolean).length;

const rows = [];
let autoFail = 0;
const auto = (id, label, ok, detail = "") => { rows.push([ok ? "✅" : "❌", id, label, detail]); if (!ok) autoFail++; };
const eye = (id, label, hint = "") => rows.push(["👁", id, label, hint]);

// ---- 1 · Keyword & SERP ----
eye("1.1", "Primary keyword unused before this post", kw ? `kw: "${kw}"` : "pass --kw to surface");
auto("1.2", "Slug clean (lowercase, hyphens)", /^[a-z0-9-]+$/.test(slug));
const brief = `scripts/blog/serp-brief-${slug}.md`;
const briefKw = kw ? `scripts/blog/serp-brief-${kw.replace(/\s+/g, "-")}.md` : "";
const briefFile = [brief, briefKw].find((f) => f && fs.existsSync(f));
if (briefFile) {
  const score = (fs.readFileSync(briefFile, "utf8").match(/SEO SCORE: (\d+)\/100/) || [])[1];
  auto("8.3a", `serp-optimize raw score ≥90 (found ${score ?? "?"}/100)`, Number(score) >= 90, briefFile.split("/").pop());
} else eye("8.3a", "serp-optimize score ≥90", "no brief — run blog:serp");
eye("1.3", "Genuine competitors only (no Reddit/TA/Wiki/YT/news)");
eye("1.4", "Length IN the serp band — see blog:stats", `${words}w`);
eye("1.5", "Gap found: must-haves · PAA · friend-details · freshness");

// ---- 2 · First paragraph ----
const intro = body.split(/\n {0,3}##/)[0];
const firstBold = (intro.match(/\*\*([^*]+)\*\*/) || [])[1] || "";
auto("2.2", "Intro bolds the answer PHRASE (not a sentence)", !!firstBold && firstBold.length <= 120 && !/[.!?] /.test(firstBold), firstBold ? `"${firstBold.slice(0, 60)}"` : "no bold in intro");
const bodyBolds = [...body.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim());
const proseBolds = bodyBolds.filter((b) => !b.endsWith(":")).length;
const bodyH2 = (body.match(/^ {0,3}## /gm) || []).length;
auto("2.2b", `Body bolds key phrases for skimmers (${proseBolds} prose bolds / ${bodyH2} H2 → need ≥${bodyH2})`, proseBolds >= bodyH2, "skim the bolds alone, the gist should hold");
if (kw) {
  const first100 = body.toLowerCase().split(/\s+/).slice(0, 100).join(" ");
  auto("2.3", "Keyword in first 100 words + title", first100.includes(kw) && title.toLowerCase().includes(kw.split(" ").slice(-2).join(" ")));
} else eye("2.3", "Keyword in first 100 words + title", "pass --kw to auto-check");
eye("2.1/2.4", "Answer first (no tease) + dry hook in first 50 words");

// ---- 3 · TL;DR & structure ----
const tldrM = meta.match(/tldr:\s*\{[\s\S]*?answer:\s*\n?\s*"((?:[^"\\]|\\.)*)"[\s\S]*?points:\s*\[([\s\S]*?)\]/);
if (tldrM) {
  const ans = tldrM[1];
  const aw = ans.split(/\s+/).filter(Boolean).length;
  const pts = [...tldrM[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  auto("3.3a", `TL;DR answer 35-60 words (is ${aw})`, aw >= 35 && aw <= 60);
  auto("3.3b", "TL;DR answer ≠ excerpt dupe", ans.slice(0, 80) !== (excerpt || "").slice(0, 80));
  { const norm = (s) => s.toLowerCase().replace(/[*_`]/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
    const sh = (a, n = 5) => { const s = new Set(); for (let i = 0; i + n <= a.length; i++) s.add(a.slice(i, i + n).join(" ")); return s; };
    const fp = intro.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)[0] || "";
    const aSh = sh(norm(ans)), pSh = sh(norm(fp)); let shared = 0; for (const x of aSh) if (pSh.has(x)) shared++;
    auto("3.3e", `TL;DR answer ≠ first paragraph (${shared} shared 5-word phrases)`, shared === 0); }
  auto("3.3c", `TL;DR 3-5 bold-led takeaways (${pts.length} pts)`, pts.length >= 3 && pts.length <= 5 && pts.every((p) => p.startsWith("**")));
  const h2s = [...body.matchAll(/^ {0,3}## (.+)$/gm)].map((m) => m[1].trim().toLowerCase());
  auto("3.3d", "TL;DR points are not section titles", !pts.some((p) => h2s.includes(p.replace(/\*/g, "").trim().toLowerCase())));
} else auto("3.3", "TL;DR box present (tldr field)", false, "no tldr field — add { answer, points }");
const faqM = meta.match(/faqs:\s*\[([\s\S]*?)\]/);
const faqQs = faqM ? [...faqM[1].matchAll(/q:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)].length : 0;
auto("3.4", `FAQ has 4-8 questions (${faqQs})`, faqQs >= 4 && faqQs <= 8, "FAQ = leftover questions only — not body dupes");
eye("3.1/3.2", "PAA answered in body, narratively; snippet format matched");
const headIds = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].replace(/\*\*/g, "").trim());
auto("3.6", `ToC renders (≥3 H2 → ${headIds.length})`, headIds.length >= 3, "anchors auto-slugged by the renderer");

// ---- 4 · Helpful ----
auto("4.7", 'Visible "as of 20xx" freshness signal', /as of (\w+ )?20\d\d/i.test(body) || /\b20\d\d\b/.test(body));
eye("4.1", "2-3 first-hand details no competitor has");
eye("4.3/4.4/4.5", "Next-question anticipated · decision-helper · ≤2 sensory lines");
const internal = (body.match(/\]\((\/(?:hotels|destinations|search|blog|about|#)[^)]*)\)/g) || []).length;
auto("4.8", `3+ internal links to real pages (${internal})`, internal >= 3);

// ---- 4b · Related "read next" (vector, not chronological) ----
let related = {};
try { related = JSON.parse(fs.readFileSync("content/blog-related.json", "utf8")); } catch { /* none */ }
const relSlugs = related[slug] || [];
const totalPosts = (src.match(/slug:\s*"/g) || []).length;
if (totalPosts < 2) eye("4.9", "Related-posts (vector) — needs ≥2 posts", `only ${totalPosts} post(s) so far`);
else auto("4.9", `Post is in content/blog-related.json with neighbors (${relSlugs.length})`, relSlugs.length >= 1, "run blog:related (embed-related.mjs)");

// ---- 5 · Voice ----
const bangs = (body.replace(/!\[/g, "").match(/!/g) || []).length;
auto("5.3a", `No exclamation marks in prose (${bangs})`, bangs === 0);
auto("5.3b", "No emoji", !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(body));
eye("5.1/5.2", "Dry beat every ~200-300w · varied rhythm · sign-off lands — run blog:voice");
eye("5.4", "≤1 opinion (with a real number) · ≤1 story");

// ---- 6 · SEO/meta/images/visuals ----
auto("6.1b", `description ≤160 (${desc.length})`, desc.length > 0 && desc.length <= 160);
if (seoTitle) auto("6.1a", `seoTitle ≤60 (${seoTitle.length})`, seoTitle.length <= 60); else eye("6.1a", "seoTitle optional — H1 title used", `title ${title.length} chars`);
auto("6.3a", "Cover has descriptive alt", coverAlt.length >= 10, coverAlt ? `"${coverAlt.slice(0, 50)}"` : "no alt");
const inBodyImgs = (body.match(/!\[[^\]]*\]\(/g) || []).length;
const igs = [...body.matchAll(/^\s*::infographic\s+(\S+)/gm)].map((m) => m[1]);
const igSrc = fs.readFileSync("src/lib/infographics.ts", "utf8");
const igUnknown = igs.filter((k) => !new RegExp(`["']${k}["']\\s*:`).test(igSrc));
auto("6.5a", `Infographic keys all exist in the registry (${igs.length} used${igUnknown.length ? `, ${igUnknown.length} UNKNOWN: ${igUnknown.join(",")}` : ""})`, igUnknown.length === 0);
const tables = (body.match(/\n\s*\|[-:| ]+\|\s*\n/g) || []).length;
const visuals = igs.length + inBodyImgs + tables;
const need = Math.max(2, Math.round(words / 500));
auto("6.5", `Visual cadence ≥1/~500w (${visuals} = ${igs.length} ig + ${inBodyImgs} img + ${tables} table / ${words}w → need ~${need})`, visuals >= need);
const longParas = body.split(/\n\n+/).filter((p) => !p.startsWith("|") && !p.startsWith("-") && !p.startsWith("::") && p.split(/\s+/).length > 150).length;
auto("6.4", `No paragraph >150 words (${longParas} over)`, longParas === 0);

// ---- 7 · Hotel cards (the cost-plus equivalent of affiliate links) ----
const hotelIds = [...body.matchAll(/^\s*::hotel\s+(\S+)/gm)].map((m) => m[1]);
const badIds = hotelIds.filter((id) => !/^lp[0-9a-z]+$/i.test(id));
if (hotelIds.length) auto("7.2", `::hotel ids look valid (${hotelIds.length}${badIds.length ? `, BAD: ${badIds.join(",")}` : ""})`, badIds.length === 0, "the page drops any id missing from the directory");
else eye("7.2", "Link to real inventory (hotel cards / city hub / search) — the ONE CTA");
eye("7.1", "Every monetizable intent routes to a real page; no fake-deal framing");

// ---- 8 · Schema/build (auto from the route) ----
auto("8.2", "JSON-LD auto-emitted (BlogPosting+FAQPage+BreadcrumbList)", true, "guaranteed by src/app/blog/[slug]/page.tsx from the Post fields");
auto("8.4", "Author byline is a named person (E-E-A-T)", !!(meta.match(/author:\s*"([^"]*)"/) || [])[1] && !/author:\s*"the travelpluscost team"/i.test(meta), (meta.match(/author:\s*"([^"]*)"/) || [])[1] || "?");
eye("8.1/8.3", "build clean + lint 0 errors + Lighthouse ≥95/100/100/100 — paste scores");
eye("8.5", "1-3 internal backlinks IN from other posts · focused commit · hold for go-live");

// ---- print ----
const W = Math.max(...rows.map((r) => r[2].length));
console.log(`\n📋 POST CHECKLIST — ${slug} (${words}w)${kw ? ` · kw: "${kw}"` : ""}\n`);
let section = "";
for (const [mark, id, label, detail] of rows) {
  if (id[0] !== section) { section = id[0]; console.log("—".repeat(W + 16)); }
  console.log(`${mark}  ${id.padEnd(7)} ${label.padEnd(W)}${detail ? "  · " + detail : ""}`);
}
console.log("—".repeat(W + 16));
const autos = rows.filter((r) => r[0] === "✅" || r[0] === "❌").length;
console.log(`AUTO: ${autos - autoFail}/${autos} pass${autoFail ? ` — ${autoFail} FAILING` : ""} · 👁 ${rows.filter((r) => r[0] === "👁").length} judgment rows to verify\n`);
process.exit(autoFail ? 1 : 0);
