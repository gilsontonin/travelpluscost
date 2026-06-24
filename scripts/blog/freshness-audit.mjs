// freshness-audit.mjs — flag PERISHABLE claims in a post (prices, hours, fees, dates, "currently",
// open/closed, "as of") that should be re-verified at the source before (re)publishing. Gemini
// surfaces the candidates; you verify each at the primary source (the audit over-flags — never apply
// blind). Reads GEMINI_API_KEY.
//   npm run blog:freshness -- <slug>
import fs from "node:fs";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY not set (run via npm run blog:freshness)."); process.exit(1); }
const slug = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!slug) { console.error("usage: freshness-audit.mjs <slug>"); process.exit(1); }

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const at = src.indexOf(`slug: "${slug}"`);
if (at < 0) { console.error(`post not found: ${slug}`); process.exit(1); }
const bodyStart = src.indexOf("body: `", at);
const body = src.slice(bodyStart + 7, src.indexOf("`,", bodyStart + 7));

const prompt = `You are a fact-freshness auditor for a travel blog. From the post below, extract every
PERISHABLE claim that could go stale and should be re-verified at the source before publishing — e.g.
specific prices/fees, opening hours, dates, "currently/now/as of", "free", open/closed status, named
seasonal facts, counts that change. For each, quote the exact phrase and say what to verify. Ignore
evergreen facts (geography, directions, general advice). Return JSON only: an array of
{ "claim": string (exact quote), "verify": short instruction }.

Post body:
"""${body.replace(/```/g, "").slice(0, 14000)}"""`;

const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
});
if (!r.ok) { console.error("gemini error", r.status, (await r.text()).slice(0, 300)); process.exit(1); }
const txt = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || "[]";
let claims;
try { claims = JSON.parse(txt); } catch { console.error("parse error:\n", txt.slice(0, 500)); process.exit(1); }

console.log(`\nFRESHNESS AUDIT — /blog/${slug}  (${claims.length} perishable claim(s) flagged)`);
console.log(`The audit OVER-flags — verify each at the SOURCE, never apply blind.\n`);
claims.forEach((c, i) => console.log(`${i + 1}. "${c.claim}"\n   → ${c.verify}\n`));
console.log(`After verifying: fix or remove stale claims, keep a visible "as of 2026", re-run blog:qa.`);
process.exit(0);
