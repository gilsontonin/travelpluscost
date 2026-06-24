#!/usr/bin/env node
// Just-in-time INVENTORY PICKER for the write-blog-post flow.
//
// Two modes, auto-selected:
//   • REGION mode — an ingested market (content/<slug>.json): groups hotels by AREA, ranks by score.
//   • DIRECTORY mode — any other US city: pulls that city's top hotels from the live directory
//     (Supabase), review-weighted. This is what powers "where to stay in <any city>" posts.
// Either way it prints ready-to-paste directive lines (::hotel / ::rail / ::map / ::compare) with real
// ids, so an inventory-forward post is assembled from real data in seconds — never hand-guessed.
//
// Usage:
//   npm run blog:hotels -- maui            # region mode (area-grouped)
//   npm run blog:hotels -- charleston      # directory mode (any US city)
//   npm run blog:hotels -- "panama city beach"

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTENT = join(ROOT, "content");

const dest = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ").trim();
if (!dest) { console.error("usage: npm run blog:hotels -- <market or city>"); process.exit(1); }
const slug = dest.toLowerCase().replace(/[^a-z0-9]/g, "");
const file = join(CONTENT, `${slug}.json`);
const title = (s) => s.replace(/[a-z0-9]+/gi, (w) => w[0].toUpperCase() + w.slice(1));

// Review-weighted rating (mirrors src/lib/directory.ts): a 1-review 10 can't top a well-reviewed favourite.
const weighted = (rating, reviews) => (((reviews ?? 0) * (rating ?? 0)) + 25 * 8) / ((reviews ?? 0) + 25);

if (existsSync(file)) {
  // ---- REGION mode: area-grouped from the ingested dataset --------------------------------------
  const AREAS = ["kaanapali", "kapalua", "napili", "kahana", "honokowai", "wailea", "makena", "kihei",
    "lahaina", "paia", "makawao", "kula", "wailuku", "kahului", "hana", "waikiki", "ko olina", "kailua",
    "north shore", "haleiwa", "the strip", "downtown", "bellagio", "henderson"];
  const areaOf = (h) => {
    const t = `${h.city || ""} ${h.address || ""} ${h.name || ""}`.toLowerCase();
    return AREAS.find((a) => t.includes(a)) || "other";
  };
  const byScore = (x, y) => weighted(y.rating, y.reviewCount) - weighted(x.rating, x.reviewCount);
  const hotels = JSON.parse(readFileSync(file, "utf8"));
  const byArea = {};
  for (const h of hotels) (byArea[areaOf(h)] ??= []).push(h);
  const areas = Object.entries(byArea).map(([a, hs]) => [a, hs.sort(byScore)]).sort((a, b) => b[1].length - a[1].length);
  console.log(`\n🏨  INVENTORY — ${title(dest)} (region)   (${hotels.length} hotels · content/${slug}.json)\n` + "=".repeat(60));
  for (const [area, hs] of areas) {
    console.log(`\n[${area.toUpperCase()}]  ${hs.length} hotel${hs.length === 1 ? "" : "s"}`);
    for (const h of hs.slice(0, 5)) console.log(`  ${h.id.padEnd(11)} ${String(h.name).slice(0, 42).padEnd(43)} ${(h.rating ?? 0).toFixed(1).padStart(4)} / ${String(h.reviewCount ?? "—").padStart(5)}  ${h.hotelType ?? ""}`);
    if (area !== "other") console.log(`     → ::rail ${title(area)}      → ::hotel ${hs[0].id}  (top-rated)`);
  }
  const named = areas.filter(([a]) => a !== "other");
  console.log(`\nSUGGESTED:  ::search ${title(dest)}   ::map ${title(dest)}`);
  if (named.length >= 2) console.log(`  ::compare ${named[0][1][0].id} ${named[1][1][0].id}   (${title(named[0][0])} vs ${title(named[1][0])})`);
  console.log("");
  process.exit(0);
}

// ---- DIRECTORY mode: any US city, live from Supabase + RATE-VERIFIED ----------------------------
// Only feature hotels that return a LIVE rate. That one rule drops the junk that slipped the
// kind=rental purge: vacation-rental listings mis-tagged kind=hotel, timeshares, and direct-only
// resorts LiteAPI can't price. A name-spam guard is the belt-and-suspenders. `--fast` skips the check.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error("✗ Directory mode needs Supabase env — run via `npm run blog:hotels` (loads .env.local)."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const FAST = process.argv.includes("--fast");
const PRICES_URL = process.env.PRICES_URL || "https://travelpluscost.com/api/prices";
const { data, error } = await sb.from("hotels")
  .select("id,name,city,state,stars,rating,review_count,property_type,thumbnail")
  .eq("country", "us").eq("kind", "hotel").ilike("city", dest)
  .not("thumbnail", "is", null)            // a card needs a real photo
  .order("review_count", { ascending: false }).limit(80);
if (error) { console.error("✗", error.message); process.exit(1); }
if (!data?.length) {
  const regions = readdirSync(CONTENT).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).filter((s) => !["blog-related", "keywords", "geo-index"].includes(s));
  console.error(`✗ No hotels for "${dest}" in the directory. (Ingested regions: ${regions.join(", ")})`);
  process.exit(1);
}

// A midweek night ~3 weeks out (mirrors src/lib/fromDate) — high availability, so rate coverage is real.
const fromDate = () => {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 21);
  d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7));
  const ymd = (x) => x.toISOString().slice(0, 10);
  const checkin = ymd(d); d.setDate(d.getDate() + 1);
  return { checkin, checkout: ymd(d) };
};
const SPAM = /\b(condos?|remodeled|sleeps|\d+\s*(br|bed|bedrooms?)|vacation rental|townhomes?|entire (home|place|house))\b/i;
const perNight = (p) => (p ? "$" + Math.round((p.allIn ?? p.amount) / p.nights) : "—");

let priced = {};
if (!FAST) {
  process.stdout.write(`rate-checking ${data.length} candidates… `);
  try {
    const r = await fetch(PRICES_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hotelIds: data.map((h) => h.id), adults: 2, ...fromDate() }) });
    priced = (await r.json()).prices || {};
    console.log(`${Object.keys(priced).length} returned a live rate.`);
  } catch (e) { console.log(`\n⚠ rate-check failed (${e.message}) — showing UNVERIFIED. Use --fast to skip on purpose.`); }
}

const hasRate = (h) => FAST || priced[h.id];
const kept = data.filter((h) => hasRate(h) && !SPAM.test(h.name));
const droppedNoRate = FAST ? [] : data.filter((h) => !priced[h.id]);
const droppedSpam = data.filter((h) => hasRate(h) && SPAM.test(h.name));
const ranked = kept.sort((a, b) => weighted(b.rating, b.review_count) - weighted(a.rating, a.review_count));
const states = [...new Set(ranked.map((h) => h.state).filter(Boolean))];

console.log(`\n🏨  INVENTORY — ${title(dest)} (directory${FAST ? "" : ", rate-verified"})   (${ranked.length} bookable hotel${ranked.length === 1 ? "" : "s"}${states.length ? ` · ${states.join("/")}` : ""})\n` + "=".repeat(60));
for (const h of ranked.slice(0, 12)) {
  console.log(`  ${h.id.padEnd(11)} ${perNight(priced[h.id]).padStart(5)}  ${(h.rating ?? 0).toFixed(1).padStart(4)}/${String(h.review_count ?? "—").padStart(5)}  ${String(h.name).slice(0, 44)}`);
}
if (!FAST) console.log(`\n  filtered out: ${droppedNoRate.length} with no live rate (condos / timeshares / direct-only) + ${droppedSpam.length} name-spam — NOT safe for cards.`);
if (ranked.length < 8) console.log(`\n  ⚠ only ${ranked.length} rate-verified hotels — below the ≥8 inventory gate. Consider skipping this city.`);
console.log(`\nSUGGESTED DIRECTIVES  (set the post's region: { name: "${title(dest)}", destination: "${title(dest)}" } first)`);
console.log(`  ::search ${title(dest)}      ::rail ${title(dest)}      ::map ${title(dest)}`);
console.log(`  ::hotel ${ranked[0].id}   (top-rated, ${perNight(priced[ranked[0].id])}/night)`);
if (ranked.length >= 2) console.log(`  ::compare ${ranked[0].id} ${ranked[1].id}`);
console.log(`  Only the rate-verified hotels above are safe for ::hotel cards — they'll all show a price, no condos/timeshares/junk.\n`);
