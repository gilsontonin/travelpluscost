// paa-suggest.mjs — GEO/FAQ gap-finder. Asks Gemini for the most important real "People Also Ask"
// questions about a post's topic that it does NOT already answer. Gemini surfaces the QUESTIONS; you
// (Claude) write the ANSWERS in the house voice. Answers are never auto-generated here.
//   npm run blog:paa -- <slug> [--kw "<primary>"]
import fs from "node:fs";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY not set (run via npm run blog:paa, which loads .env.local)."); process.exit(1); }
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const kw = (args.includes("--kw") ? args[args.indexOf("--kw") + 1] : "") || slug?.replace(/-/g, " ");
if (!slug) { console.error('usage: paa-suggest.mjs <slug> [--kw "..."]'); process.exit(1); }

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const at = src.indexOf(`slug: "${slug}"`);
if (at < 0) { console.error(`post not found: ${slug}`); process.exit(1); }
const bodyStart = src.indexOf("body: `", at);
const body = src.slice(bodyStart + 7, src.indexOf("`,", bodyStart + 7));
const meta = src.slice(at, bodyStart);
const title = (meta.match(/title:\s*\n?\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || slug;
const existingFaqs = [...meta.matchAll(/q:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

const prompt = `You are an SEO + GEO (generative-engine-optimization) analyst for travelpluscost, a transparent
"cost-plus" hotel booking site (the same honest price for everyone, never set from your data).
Post title: "${title}"
Primary keyword: "${kw}"
The post already answers these FAQ questions: ${existingFaqs.length ? existingFaqs.map((q) => `"${q}"`).join("; ") : "(none)"}

Post body:
"""${body.replace(/```/g, "").slice(0, 12000)}"""

List the 6-8 most valuable REAL "People Also Ask"-style questions a traveler (or an AI answer engine
like ChatGPT/Perplexity/Google AI Overviews) would ask about this exact topic that the post does NOT
already clearly answer — genuine gaps only, no duplicates, no generic filler. Favor specific, answerable,
high-intent questions (cost, timing, how-to, is-it-worth-it, comparisons, logistics). Return JSON only:
an array of { "question": string, "why": short reason it matters for GEO/intent }.`;

const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.4 } }),
});
if (!r.ok) { console.error("gemini error", r.status, (await r.text()).slice(0, 300)); process.exit(1); }
const txt = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || "[]";
let qs;
try { qs = JSON.parse(txt); } catch { console.error("parse error:\n", txt.slice(0, 500)); process.exit(1); }

console.log(`\nGEO/FAQ gaps for /blog/${slug}  (kw: "${kw}") — post already answers ${existingFaqs.length} FAQ(s).\n`);
qs.forEach((q, i) => console.log(`${i + 1}. ${q.question}\n   ↳ ${q.why}\n`));
console.log(`Next: GREP-GATE each (most are already covered). For genuine gaps, write a crisp house-voice`);
console.log(`answer (40-55w, bold lead phrase) and add it to the post's faqs[]. Re-run blog:slop + build.`);
