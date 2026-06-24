#!/usr/bin/env node
// Just-in-time INVENTORY PICKER for the write-blog-post flow.
//
// Given a market, reads its region dataset (content/<slug>.json — the same real LiteAPI data the
// app serves), groups hotels by area, ranks by guest score, and prints ready-to-paste directive
// lines (::hotel / ::rail / ::map / ::compare) with real ids. So an inventory-forward post is
// assembled from real data in seconds, never hand-guessed. No API cost — reads the local dataset.
//
// Usage:
//   node scripts/blog/hotels.mjs maui
//   node scripts/blog/hotels.mjs "las vegas"        # -> content/lasvegas.json
//   npm run blog:hotels -- maui

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTENT = join(ROOT, "content");

const dest = process.argv.slice(2).join(" ").trim();
if (!dest) { console.error("usage: node scripts/blog/hotels.mjs <market>   (e.g. maui)"); process.exit(1); }
const slug = dest.toLowerCase().replace(/[^a-z0-9]/g, "");
const file = join(CONTENT, `${slug}.json`);

if (!existsSync(file)) {
  const regions = readdirSync(CONTENT)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((s) => !["blog-related", "keywords", "geo-index"].includes(s));
  console.error(`✗ No dataset content/${slug}.json. Ingested markets: ${regions.join(", ")}`);
  process.exit(1);
}

// Areas to bucket by — order matters (first match wins); West-side towns before the broad "lahaina".
const AREAS = ["kaanapali", "kapalua", "napili", "kahana", "honokowai", "wailea", "makena", "kihei",
  "lahaina", "paia", "makawao", "kula", "wailuku", "kahului", "hana", "waikiki", "ko olina", "kailua",
  "north shore", "haleiwa", "the strip", "downtown", "bellagio", "henderson"];
const areaOf = (h) => {
  const t = `${h.city || ""} ${h.address || ""} ${h.name || ""}`.toLowerCase();
  return AREAS.find((a) => t.includes(a)) || "other";
};
const title = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const hotels = JSON.parse(readFileSync(file, "utf8"));
// Rank by guest score, but a property needs a credible review base to lead (a 1-review condo
// scoring 10 shouldn't top an 880-review resort).
const conf = (h) => ((h.reviewCount ?? 0) >= 20 ? 1 : 0);
const byScore = (x, y) => conf(y) - conf(x) || (y.rating ?? 0) - (x.rating ?? 0) || (y.reviewCount ?? 0) - (x.reviewCount ?? 0);
const byArea = {};
for (const h of hotels) (byArea[areaOf(h)] ??= []).push(h);
const areas = Object.entries(byArea)
  .map(([a, hs]) => [a, hs.sort(byScore)])
  .sort((a, b) => b[1].length - a[1].length);

console.log(`\n🏨  INVENTORY — ${title(dest)}   (${hotels.length} hotels · content/${slug}.json)\n` + "=".repeat(60));
for (const [area, hs] of areas) {
  console.log(`\n[${area.toUpperCase()}]  ${hs.length} hotel${hs.length === 1 ? "" : "s"}`);
  for (const h of hs.slice(0, 5)) {
    const score = h.rating != null ? `${h.rating.toFixed(1)}` : "—";
    console.log(`  ${h.id.padEnd(11)} ${String(h.name).slice(0, 42).padEnd(43)} ${score.padStart(4)} / ${String(h.reviewCount ?? "—").padStart(5)}  ${h.hotelType ?? ""}`);
  }
  if (area !== "other") console.log(`     → ::rail ${title(area)}      → ::hotel ${hs[0].id}  (top-rated)`);
}

// Suggest a cross-area compare (top of the two biggest named areas) + a market map.
const named = areas.filter(([a]) => a !== "other");
console.log(`\nSUGGESTED DIRECTIVES`);
console.log(`  ::search ${title(dest)}`);
console.log(`  ::map ${title(dest)}`);
if (named.length >= 2) console.log(`  ::compare ${named[0][1][0].id} ${named[1][1][0].id}   (${title(named[0][0])} vs ${title(named[1][0])}, top-rated each)`);
console.log("");
