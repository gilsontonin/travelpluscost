#!/usr/bin/env node
// Just-in-time AREAS tool — the Booking "Top cities (Lahaina 513 · Wailea 1,120)" pattern, honest.
//
// Reads a market's dataset for its real cities, then queries the live directory (Supabase) for the
// REAL count of hotels in each — the only honest source for an "{n} stays in {area}" claim (our
// curated dataset is a sample, not the full inventory). Prints the counts + the ::areas directive.
//
// Usage:  node --env-file=.env.local scripts/blog/areas.mjs maui   |   npm run blog:areas -- maui

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dest = process.argv.slice(2).join(" ").trim();
if (!dest) { console.error("usage: node --env-file=.env.local scripts/blog/areas.mjs <market>"); process.exit(1); }
const slug = dest.toLowerCase().replace(/[^a-z0-9]/g, "");
const file = join(ROOT, "content", `${slug}.json`);
if (!existsSync(file)) { console.error(`✗ No dataset content/${slug}.json`); process.exit(1); }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error("✗ Missing Supabase env — run with: node --env-file=.env.local …"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const hotels = JSON.parse(readFileSync(file, "utf8"));
const cities = [...new Set(hotels.map((h) => h.city).filter(Boolean))];

const counts = await Promise.all(
  cities.map(async (city) => {
    const { count } = await sb.from("hotels").select("id", { count: "exact", head: true })
      .eq("country", "us").ilike("city", city).eq("kind", "hotel");
    return { city, count: count ?? 0 };
  }),
);
counts.sort((a, b) => b.count - a.count);

const title = (s) => s.replace(/[a-z0-9]+/gi, (w) => w[0].toUpperCase() + w.slice(1));
console.log(`\n🗺️   AREAS — ${title(dest)}   (live directory counts)\n` + "=".repeat(46));
for (const { city, count } of counts) console.log(`  ${String(count).padStart(5)}  stays   ${city}`);
console.log(`\n  Drop into the post:  ::areas ${title(dest)}`);
console.log(`  (the widget renders only areas with stays, with these live counts)\n`);
