#!/usr/bin/env node
// AREAS tool — discover a destination's areas + their live inventory, for ::areas / ::rail directives.
//
//   • REGION mode  (ingested market, content/<slug>.json): the market's real CITIES + live hotel counts
//     (the Booking "Top cities" pattern) → ::areas <market>.
//   • DIRECTORY mode (any other US city): auto-discovers NEIGHBOURHOODS from the hotels' own names —
//     a location phrase that recurs across ≥3 real hotels is a real, inventory-backed area. These are
//     exactly what `::rail <area>` resolves city-scoped via hotelsInArea(), with no cross-city leak.
//
// Usage:  npm run blog:areas -- maui        (region)   |   npm run blog:areas -- branson   (directory)

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dest = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ").trim();
if (!dest) { console.error("usage: npm run blog:areas -- <market or city>"); process.exit(1); }
const slug = dest.toLowerCase().replace(/[^a-z0-9]/g, "");
const file = join(ROOT, "content", `${slug}.json`);
const title = (s) => s.replace(/[a-z0-9]+/gi, (w) => w[0].toUpperCase() + w.slice(1));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error("✗ Missing Supabase env — run with: node --env-file=.env.local …"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

if (existsSync(file)) {
  // ---- REGION mode: the market's cities + live counts (Booking "Top cities" pattern) -------------
  const hotels = JSON.parse(readFileSync(file, "utf8"));
  const cities = [...new Set(hotels.map((h) => h.city).filter(Boolean))];
  const counts = await Promise.all(
    cities.map(async (city) => {
      const { count } = await sb.from("hotels").select("id", { count: "exact", head: true }).eq("country", "us").ilike("city", city).eq("kind", "hotel");
      return { city, count: count ?? 0 };
    }),
  );
  counts.sort((a, b) => b.count - a.count);
  console.log(`\n🗺️   AREAS — ${title(dest)}   (region · live directory counts)\n` + "=".repeat(46));
  for (const { city, count } of counts) console.log(`  ${String(count).padStart(5)}  stays   ${city}`);
  console.log(`\n  Drop into the post:  ::areas ${title(dest)}`);
  console.log(`  (the widget renders only areas with stays, with these live counts)\n`);
  process.exit(0);
}

// ---- DIRECTORY mode: auto-discover NEIGHBOURHOODS from hotel names --------------------------------
// The directory has no neighbourhood column, so we mine the hotels' own names: a location phrase that
// recurs across ≥3 real hotels is a real, inventory-backed area (Thousand Hills, Table Rock, Indian
// Point…). Those are exactly what `::rail <area>` resolves city-scoped via hotelsInArea — no leak. An
// area under 3 falls back to a city-wide rail.
const SPAM = /\b(condos?|condotel|remodeled|sleeps|\d+\s*(br|bed|bedrooms?)|vacation rentals?|townhomes?|entire (home|place|house))\b/i;
const { data, error } = await sb.from("hotels").select("name").eq("country", "us").ilike("city", dest).eq("kind", "hotel").limit(500);
if (error) { console.error("✗", error.message); process.exit(1); }
if (!data?.length) { console.error(`✗ No hotels for "${dest}" in the directory.`); process.exit(1); }
const names = data.map((h) => h.name).filter((n) => n && !SPAM.test(n));

// Stopwords: hotel-type words, the big chain/brand words, compass/filler words, and the city itself.
// What's left of a name is its distinctive location phrase; recurring 2–3-grams of those are the areas.
const cityWords = new Set(dest.toLowerCase().split(/\s+/));
const STOP = new Set([
  "hotel", "hotels", "inn", "inns", "suites", "suite", "resort", "resorts", "lodge", "lodges", "motel",
  "spa", "by", "the", "at", "of", "on", "near", "and", "a", "an", "to", "for", "with", "your",
  "wyndham", "best", "western", "plus", "comfort", "quality", "holiday", "express", "days", "super",
  "econo", "baymont", "ramada", "clarion", "sleep", "americas", "value", "grand", "hampton", "hilton",
  "marriott", "fairfield", "quinta", "tru", "home2", "towneplace", "candlewood", "wingate", "microtel",
  "studio", "extended", "stay", "downtown", "central", "north", "south", "east", "west", "collection",
  "ascend", "choice", "wyndhams", "boutique", "luxury", "resorts", "view", "place", "house", "park",
  ...cityWords,
]);
const clean = (n) => n.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
const grams = new Map(); // phrase -> Set of hotel indices it appears in
names.forEach((n, i) => {
  const toks = clean(n);
  for (let k = 0; k + 1 < toks.length; k++) {
    for (const len of [3, 2]) {
      if (k + len <= toks.length) {
        const g = toks.slice(k, k + len).join(" ");
        (grams.get(g) ?? grams.set(g, new Set()).get(g)).add(i);
      }
    }
  }
});
const areas = [...grams.entries()]
  .map(([area, s]) => ({ area, n: s.size }))
  .filter((x) => x.n >= 3)
  .sort((a, b) => b.n - a.n || b.area.length - a.area.length);
// De-dup overlapping phrases: keep the highest-count one, drop any that contains or is contained by it.
const kept = [];
for (const x of areas) if (!kept.some((k) => k.area.includes(x.area) || x.area.includes(k.area))) kept.push(x);

console.log(`\n🗺️   NEIGHBOURHOODS — ${title(dest)}   (directory · mined from ${names.length} hotel names)\n` + "=".repeat(58));
if (!kept.length) console.log(`  (no recurring area phrases — cover neighbourhoods in prose; a city-wide ::rail ${title(dest)} still works)`);
for (const { area, n } of kept.slice(0, 12)) console.log(`  ${String(n).padStart(3)} hotels   ::rail ${title(area)}`);
console.log(`\n  Each ≥3-hotel area resolves city-scoped via hotelsInArea (no cross-city leak); fewer than 3 falls`);
console.log(`  back to a city-wide rail. City-wide always works:  ::rail ${title(dest)}\n`);
