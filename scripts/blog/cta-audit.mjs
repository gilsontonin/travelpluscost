// cta-audit.mjs — per-section CTA + relational-link auditor (the "marketing hat" pass).
// For EACH section of a post it surfaces:
//   • the CTA — the one action the reader should take here (Gemini suggests; you decide),
//   • the directory hotels MENTIONED in the prose, matched to REAL ids → each should be a ::hotel
//     card or a link (flags "mentioned but not actioned"),
//   • RELATIONAL LEAKS — any ::rail/::search/::map/::cta or /search link whose destination isn't this
//     post's city (e.g. "Strip" leaking to the Las Vegas Strip).
// It SURFACES; you reason over it and hand-curate (add the card/link, fix the leak). Never apply blind.
//   npm run blog:cta -- <slug>
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const slug = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!slug) { console.error("usage: cta-audit.mjs <slug>"); process.exit(1); }

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const at = src.indexOf(`slug: "${slug}"`);
if (at < 0) { console.error(`post not found: ${slug}`); process.exit(1); }
const head = src.slice(at, src.indexOf("body: `", at));
const dest = (head.match(/destination:\s*"([^"]+)"/) || [])[1] || "";
const bodyStart = src.indexOf("body: `", at);
const body = src.slice(bodyStart + 7, src.indexOf("`,", bodyStart + 7));
const cityLc = (dest.split(",")[0] || "").trim().toLowerCase();

// Directory hotels for the city → match mentions to real ids + ground the leak check.
let dirHotels = [];
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL, SB_SECRET = process.env.SUPABASE_SECRET_KEY;
if (SB_URL && SB_SECRET && cityLc) {
  const sb = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });
  const { data } = await sb.from("hotels").select("id,name").eq("country", "us").ilike("city", cityLc).eq("kind", "hotel").limit(400);
  dirHotels = (data || []).filter((h) => h.name && h.name.length > 6); // skip ultra-short names (false matches)
}

// Split body into sections (each H2/H3 starts one).
const sections = [];
let cur = { heading: "(intro)", level: 1, lines: [] };
for (const l of body.split("\n")) {
  const m = l.match(/^(#{2,3})\s+(.+?)\s*$/);
  if (m) { sections.push(cur); cur = { heading: m[2], level: m[1].length, lines: [] }; } else cur.lines.push(l);
}
sections.push(cur);
const content = sections.filter((s) => s.level >= 2);

const DIRECTIVE = /^::(hotel|rail|search|map|compare|cta|areas|priceproof|infographic|details)\b\s*(.*)$/;
const LINK = /\[([^\]]+)\]\((\/[^)]+)\)/g;

// Gemini: one CTA line per section.
let ctas = {};
const KEY = process.env.GEMINI_API_KEY;
if (KEY) {
  const list = content.map((s, i) => `${i}. ${s.heading}\n${s.lines.join(" ").replace(/^\s*::.*$/gm, "").trim().slice(0, 380)}`).join("\n\n");
  const prompt = `You are a conversion strategist for a hotel site's blog. For EACH numbered section of this "where to stay" post, give the single best CTA — the one action the reader should take in THAT section (e.g. "Book Lodge of the Ozarks", "Search Table Rock Lake stays", "Compare the Strip vs the lake"). Be specific to the section's content. Return JSON only: [{ "i": number, "cta": string }].\n\nSections:\n"""${list.slice(0, 12000)}"""`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.3 } }),
    });
    if (r.ok) { const txt = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || "[]"; for (const c of JSON.parse(txt)) ctas[c.i] = c.cta; }
  } catch { /* CTA suggestions optional */ }
}

console.log(`\nCTA + RELATIONAL AUDIT — /blog/${slug}   city: ${dest || "—"}   (${dirHotels.length} directory hotels)`);
console.log(`Marketing hat: every section needs a CTA, and every hotel you mention should be a card or a link to the RIGHT hotel.`);
console.log(`This SURFACES candidates — reason over each and hand-curate; the directory match can miss/leak.\n`);

let noCta = 0, gaps = 0, leaks = 0;
for (let i = 0; i < content.length; i++) {
  const s = content[i];
  const text = s.lines.join("\n");
  const directives = s.lines.map((l) => l.trim().match(DIRECTIVE)).filter(Boolean).map((m) => ({ kind: m[1], arg: m[2].trim() }));
  const links = [...text.matchAll(LINK)].map((m) => ({ text: m[1], url: m[2] }));
  const carded = new Set(directives.filter((d) => d.kind === "hotel" || d.kind === "compare").flatMap((d) => d.arg.split(/\s+/).filter(Boolean)));
  const mentioned = dirHotels.filter((h) => (s.heading + " " + text).toLowerCase().includes(h.name.toLowerCase()));
  const hasCta = directives.some((d) => ["hotel", "rail", "search", "cta", "compare", "map"].includes(d.kind)) || links.some((l) => /^\/(search|hotels)/.test(l.url));
  const sectionLeaks = [];
  // ::rail is city-scoped via hotelsInArea (name-seed within the post's city) — it can't leak, so it's exempt.
  for (const d of directives) if (["search", "map", "cta", "areas"].includes(d.kind) && d.arg && cityLc && !d.arg.toLowerCase().includes(cityLc)) sectionLeaks.push(`::${d.kind} ${d.arg} — not "${dest}"`);
  // decodeURIComponent so multi-word cities (Wisconsin%20Dells) match cityLc ("wisconsin dells"), not a leak.
  for (const l of links) if (/^\/search/.test(l.url) && cityLc && !decodeURIComponent(l.url).toLowerCase().includes(cityLc)) sectionLeaks.push(`link "${l.text}" → ${l.url}`);

  console.log(`${"#".repeat(s.level)} ${s.heading}`);
  console.log(`   CTA → ${ctas[i] || "(decide: what's the ONE action here?)"}`);
  console.log(`   widgets: ${directives.length ? directives.map((d) => "::" + d.kind + (d.arg ? " " + d.arg : "")).join(", ") : "none"}${links.length ? " · links: " + links.map((l) => `${l.text}→${l.url}`).join(", ") : ""}`);
  if (mentioned.length) console.log(`   mentions: ${mentioned.map((h) => `${h.name}${carded.has(h.id) ? " ✓card" : " ⚠ add card/link"}`).join("; ")}`);
  for (const f of sectionLeaks) console.log(`   🔴 LEAK? ${f}`);
  if (!hasCta) console.log(`   ⚠ NO CTA widget here`);
  console.log("");
  if (!hasCta) noCta++;
  gaps += mentioned.filter((h) => !carded.has(h.id)).length;
  leaks += sectionLeaks.length;
}

console.log(`SUMMARY: ${content.length} sections · ${noCta} with NO CTA widget · ${gaps} mentioned-hotel gap(s) · ${leaks} possible leak(s).`);
console.log(`Reason now: did I MAXIMIZE each CTA? Is every card/link the CORRECT hotel/city (no leak)? Curate by hand where unsure.`);
process.exit(0);
