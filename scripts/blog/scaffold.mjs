#!/usr/bin/env node
// Just-in-time SCAFFOLD — assembles an inventory-forward post skeleton from REAL data.
//
//   • REGION mode  (ingested market, content/<slug>.json): one section per dataset area.
//   • DIRECTORY mode (any other US city): the production skeleton for "where to stay in <city>" — it
//     fuses the RATE-VERIFIED pool (blog:hotels) with the DISCOVERED neighbourhoods (blog:areas) into the
//     Branson calibration structure: CTR title + region block, at-a-glance area table, one section per
//     area (city-scoped ::rail + the top rate-verified hotel's ::hotel card per the card rule), a roundup
//     of more bookable hotels, the pricing block + ::priceproof, and an FAQ stub. Every id is real and
//     shows a price; every area is city-scoped (no leak). You paste it into src/lib/posts.ts, write the
//     prose into the <!-- … --> stubs, and run the gates to ≥90.
//
// Usage:  npm run blog:scaffold -- maui        (region)
//         npm run blog:scaffold -- branson     (directory — production skeleton)   [--fast skips rates]

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dest = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ").trim();
if (!dest) { console.error("usage: npm run blog:scaffold -- <market or city>"); process.exit(1); }
const slug = dest.toLowerCase().replace(/[^a-z0-9]/g, "");
const file = join(ROOT, "content", `${slug}.json`);
const title = (s) => s.replace(/[a-z0-9]+/gi, (w) => w[0].toUpperCase() + w.slice(1));
const weighted = (r, v) => (((v ?? 0) * (r ?? 0)) + 25 * 8) / ((v ?? 0) + 25);

if (existsSync(file)) {
  // ---- REGION mode: one section per dataset area (unchanged) ------------------------------------
  const AREAS = ["kaanapali", "kapalua", "napili", "kahana", "honokowai", "wailea", "makena", "kihei",
    "lahaina", "paia", "wailuku", "kahului", "hana", "waikiki", "ko olina", "kailua", "north shore",
    "the strip", "downtown", "henderson"];
  const areaOf = (h) => { const t = `${h.city || ""} ${h.address || ""} ${h.name || ""}`.toLowerCase(); return AREAS.find((a) => t.includes(a)) || "other"; };
  const byScore = (x, y) => weighted(y.rating, y.reviewCount) - weighted(x.rating, x.reviewCount);
  const D = title(dest);
  const hotels = JSON.parse(readFileSync(file, "utf8"));
  const byArea = {};
  for (const h of hotels) if (areaOf(h) !== "other") (byArea[areaOf(h)] ??= []).push(h);
  const named = Object.entries(byArea).map(([a, hs]) => [a, hs.sort(byScore)]).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
  const out = [`Where to stay in ${D} comes down to <!-- the one framing choice -->. <!-- ~50 words; keyword verbatim in sentence 1; a dry hook; a visible "as of 2026". -->`, "", `::search ${D}`, "", `::areas ${D}`, ""];
  for (const [area, hs] of named) {
    const A = title(area);
    out.push(`## ${A}: <!-- benefit headline -->`, "", `**<!-- bold answer: who ${A} is for. -->** <!-- 2 sentences: the vibe + the honest trade-off, one dry beat. -->`, "", `::rail ${A}`, "", `::hotel ${hs[0].id}`, "", `::details More on ${A}`, `<!-- deep detail (collapsed, still crawlable): named spots, dining, parking, who should skip it. -->`, `::/details`, "");
  }
  out.push(`## ${D} on the map`, "", `::map ${D}`, "");
  if (named.length >= 2) out.push(`## Two picks, head to head`, "", `::compare ${named[0][1][0].id} ${named[1][1][0].id}`, "");
  out.push(`## How we price the stays you find here`, "", `**<!-- the rate plus one flat fee, same for everyone, never your data. -->** <!-- link [surveillance pricing](/blog/surveillance-pricing) + [how it works](/#how). -->`, "", `::priceproof`);
  console.log(`\n# ===== SCAFFOLD (region): where to stay in ${D} =====`);
  console.log(`# Paste into a new entry in src/lib/posts.ts; fill every <!-- … --> stub. Areas/ids are REAL.\n`);
  console.log(out.join("\n"));
  console.log(`\n# ===== end scaffold =====\n`);
  process.exit(0);
}

// ---- DIRECTORY mode: production skeleton from the rate-verified pool + discovered areas -----------
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error("✗ Directory mode needs Supabase env — run via `npm run blog:scaffold` (loads .env.local)."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const FAST = process.argv.includes("--fast");
const PRICES_URL = process.env.PRICES_URL || "https://travelpluscost.com/api/prices";
const SPAM = /\b(condos?|condotel|remodeled|sleeps|\d+\s*(br|bed|bedrooms?)|vacation rentals?|townhomes?|entire (home|place|house))\b/i;
const fromDate = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 21); d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7)); const y = (x) => x.toISOString().slice(0, 10); const ci = y(d); d.setDate(d.getDate() + 1); return { checkin: ci, checkout: y(d) }; };
const perNight = (p) => (p ? "$" + Math.round((p.allIn ?? p.amount) / p.nights) : "—");

// 1) candidates → rate-verified, spam-filtered, review-ranked POOL (the only hotels safe to card)
const { data: cand, error } = await sb.from("hotels").select("id,name,city,state,rating,review_count,thumbnail")
  .eq("country", "us").eq("kind", "hotel").ilike("city", dest).not("thumbnail", "is", null)
  .order("review_count", { ascending: false }).limit(80);
if (error) { console.error("✗", error.message); process.exit(1); }
if (!cand?.length) { console.error(`✗ No hotels for "${dest}" in the directory.`); process.exit(1); }
let priced = {};
if (!FAST) {
  process.stderr.write(`rate-checking ${cand.length} candidates… `);
  try { priced = (await (await fetch(PRICES_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hotelIds: cand.map((h) => h.id), adults: 2, ...fromDate() }) })).json()).prices || {}; process.stderr.write(`${Object.keys(priced).length} priced.\n`); }
  catch (e) { process.stderr.write(`failed (${e.message}); use --fast.\n`); }
}
const pool = cand.filter((h) => (FAST || priced[h.id]) && !SPAM.test(h.name)).sort((a, b) => weighted(b.rating, b.review_count) - weighted(a.rating, a.review_count));
if (pool.length < 8) console.error(`⚠ only ${pool.length} rate-verified hotels — below the ≥8 inventory gate; consider skipping ${title(dest)}.`);
const ST = (pool.find((h) => h.state)?.state) || "";
const D = title(dest), DST = ST ? `${D}, ${ST}` : D;

// 2) discover NEIGHBOURHOODS from hotel names (name-seed 2–3-grams, ≥3 hotels) — same as blog:areas
const { data: allRows } = await sb.from("hotels").select("name").eq("country", "us").ilike("city", dest).eq("kind", "hotel").limit(500);
const cityWords = new Set(dest.toLowerCase().split(/\s+/));
const STOP = new Set(["hotel", "hotels", "inn", "inns", "suites", "suite", "resort", "resorts", "lodge", "lodges", "motel", "spa", "by", "the", "at", "of", "on", "near", "and", "a", "an", "to", "for", "with", "your", "wyndham", "best", "western", "plus", "comfort", "quality", "holiday", "express", "days", "super", "econo", "baymont", "ramada", "clarion", "sleep", "americas", "value", "grand", "hampton", "hilton", "marriott", "fairfield", "quinta", "tru", "home2", "towneplace", "candlewood", "wingate", "microtel", "studio", "extended", "stay", "downtown", "central", "north", "south", "east", "west", "collection", "ascend", "choice", "boutique", "luxury", "view", "place", "house", "park", ...cityWords]);
const clean = (n) => n.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
const grams = new Map();
(allRows || []).map((h) => h.name).filter((n) => n && !SPAM.test(n)).forEach((n, i) => {
  const toks = clean(n);
  for (let k = 0; k + 1 < toks.length; k++) for (const len of [3, 2]) if (k + len <= toks.length) { const g = toks.slice(k, k + len).join(" "); (grams.get(g) ?? grams.set(g, new Set()).get(g)).add(i); }
});
const areas = [...grams.entries()].map(([area, s]) => ({ area: title(area), n: s.size })).filter((x) => x.n >= 3).sort((a, b) => b.n - a.n || b.area.length - a.area.length);
const kept = [];
for (const x of areas) if (!kept.some((k) => k.area.toLowerCase().includes(x.area.toLowerCase()) || x.area.toLowerCase().includes(k.area.toLowerCase()))) kept.push(x);
const topAreas = kept.slice(0, 5);

// 3) card the top rate-verified pool hotel whose NAME matches each area (card rule); track who's carded
const carded = new Set();
const areaPick = (area) => { const h = pool.find((p) => !carded.has(p.id) && p.name.toLowerCase().includes(area.toLowerCase())); if (h) carded.add(h.id); return h; };
const sections = topAreas.map((a) => ({ ...a, hotel: areaPick(a.area) }));
const roundup = pool.filter((h) => !carded.has(h.id)).slice(0, 6);

// 4) emit the skeleton
const o = [];
o.push(`\n# ===== SCAFFOLD (directory): where to stay in ${DST} =====`);
o.push(`# Paste as a NEW entry in src/lib/posts.ts (slug: where-to-stay-in-${slug}). Every hotel id below is`);
o.push(`# REAL + rate-verified (shows a price); every area is mined from hotel names + city-scoped (no leak).`);
o.push(`# Fill every <!-- … --> stub, inspect the cover photo, then loop the gates (serp/slop/stats/cta/qa) to ≥90.`);
o.push(`#`);
o.push(`#   title:   "Where to Stay in ${DST}: Best Areas & Hotels (2026)"`);
o.push(`#   excerpt: <!-- 150-160 chars: the areas + a hotel + "as of 2026" (this is the SERP snippet) -->`);
o.push(`#   author:  "Gilson Tonin, MBA · Founder of travelpluscost"`);
o.push(`#   region:  { name: "${D}", destination: "${D}" }`);
o.push(`#   cover:   <!-- a famous local property's best photo OR a cute, colourful town shot — INSPECT it first -->`);
o.push(`# ${"-".repeat(95)}\n`);

o.push(`Where to stay in ${D} comes down to <!-- the one deciding factor -->. <!-- ~50 words; the keyword verbatim in sentence 1; a dry hook in your real voice; a visible "as of 2026". -->`);
o.push("");
o.push(`## ${D} Hotels by Area, at a Glance`);
o.push("");
o.push(`<!-- one line: the single factor that decides the area. -->`);
o.push("");
o.push(`| Area | The feel | Best for | <!-- note --> |`);
o.push(`|---|---|---|---|`);
for (const a of topAreas) o.push(`| [${a.area}](/search?destination=${encodeURIComponent(D)}&adults=2) | <!-- feel --> | <!-- who --> | <!-- note --> |`);
o.push("");
for (const s of sections) {
  o.push(`## ${s.area}: <!-- benefit headline -->`);
  o.push("");
  o.push(`**<!-- bold answer: who ${s.area} is for. -->** <!-- 2 sentences: the vibe + the honest trade-off, one dry beat. -->`);
  o.push("");
  o.push(`::rail ${s.area}    <!-- city-scoped via hotelsInArea (${s.n} name-seed hotels); <3 would fall back to city-wide -->`);
  o.push("");
  if (s.hotel) { o.push(`### ${s.hotel.name} — <!-- the angle -->`); o.push(""); o.push(`<!-- verdict: why this one; weave the ${(s.hotel.rating ?? 0).toFixed(1)} guest score (${s.hotel.review_count} reviews). -->`); o.push(""); o.push(`::hotel ${s.hotel.id}    <!-- ${perNight(priced[s.hotel.id])}/night -->`); }
  else o.push(`### <!-- name a rate-verified ${s.area} hotel from the pool below -->\n\n::hotel <!-- id --> `);
  o.push("");
  o.push(`**Best for:** <!-- … -->`);
  o.push("");
}
o.push(`## A Few ${D} Hotels Worth Booking`);
o.push("");
o.push(`<!-- intro: real, well-reviewed picks; guest scores as of 2026; no stamped prices, rates move daily. -->`);
o.push("");
o.push(`| Hotel | Area | Guest score | Best for |`);
o.push(`|---|---|---|---|`);
for (const h of roundup) o.push(`| ${h.name} | <!-- area --> | ${(h.rating ?? 0).toFixed(1)} | <!-- … --> |`);
o.push("");
for (const h of roundup) { o.push(`### ${h.name} — <!-- angle -->`); o.push(""); o.push(`<!-- verdict; weave the ${(h.rating ?? 0).toFixed(1)} score. -->`); o.push(""); o.push(`::hotel ${h.id}    <!-- ${perNight(priced[h.id])}/night -->`); o.push(""); }
o.push(`## How we price the stays you find here`);
o.push("");
o.push(`**<!-- the rate plus one flat fee, the same for everyone, never your data. -->** <!-- link [surveillance pricing](/blog/surveillance-pricing) + [how it works](/#how); honor POSITIONING (never the net cost or markup %). -->`);
o.push("");
o.push(`::priceproof`);
o.push("");
o.push(`## ${D} hotels: quick answers`);
o.push("");
o.push(`**<!-- Q: cheapest area to stay in ${D}? -->**\n<!-- A -->`);
o.push("");
o.push(`**<!-- Q: best area for families? -->**\n<!-- A -->`);
o.push("");
o.push(`**<!-- Q: how far is <X> from <Y>? -->**\n<!-- A -->`);
o.push("");
o.push(`# ${"-".repeat(95)}`);
o.push(`# RATE-VERIFIED POOL (${pool.length} hotels, all show a price — safe for ::hotel cards):`);
for (const h of pool.slice(0, 16)) o.push(`#   ${h.id.padEnd(11)} ${perNight(priced[h.id]).padStart(5)}  ${(h.rating ?? 0).toFixed(1)}/${String(h.review_count ?? "—").padStart(5)}  ${h.name.slice(0, 44)}`);
o.push(`# AREAS (≥3 name-seed hotels, city-scoped): ${topAreas.map((a) => `${a.area} (${a.n})`).join(" · ") || "none — cover neighbourhoods in prose; use ::rail " + D}`);
o.push(`# ===== end scaffold =====\n`);
console.log(o.join("\n"));
