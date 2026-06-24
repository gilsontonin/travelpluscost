#!/usr/bin/env node
// CITY OPPORTUNITY SCORER — the disciplined front-end of the "where to stay in <city>" program.
//
// "Every city we can win" only works if each page has real substance. This is the FREE first filter:
// it counts our REAL hotel inventory per US city (the directory), keeps only cities with enough to
// make a genuine, non-thin guide, and ranks them. You then Semrush-vet the top (volume/KD) when
// picking the pilot batch — so we target winnable, substantial cities, never spray thin templates.
//
// Usage:
//   node --env-file=.env.local scripts/blog/opportunities.mjs              # cities with >=8 hotels
//   node --env-file=.env.local scripts/blog/opportunities.mjs --min 12 --top 60
//   npm run blog:opportunities -- --min 10

import { createClient } from "@supabase/supabase-js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const MIN = parseInt(arg("--min", "8"), 10);   // inventory floor for a non-thin guide
const TOP = parseInt(arg("--top", "80"), 10);  // how many to print

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error("✗ Missing Supabase env — run with: node --env-file=.env.local …"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

// Page through every US hotel (light: city + state only) and tally per city.
process.stderr.write("counting inventory by city…\n");
const counts = new Map(); // "City|ST" -> n
let from = 0;
const PAGE = 1000;
for (;;) {
  const { data, error } = await sb.from("hotels").select("city,state")
    .eq("country", "us").eq("kind", "hotel").range(from, from + PAGE - 1);
  if (error) { console.error("✗", error.message); process.exit(1); }
  if (!data?.length) break;
  for (const h of data) {
    if (!h.city) continue;
    const k = `${h.city}|${h.state ?? ""}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  if (data.length < PAGE) break;
  from += PAGE;
}

const ranked = [...counts.entries()]
  .map(([k, n]) => { const [city, st] = k.split("|"); return { city, st, n }; })
  .filter((r) => r.n >= MIN)
  .sort((a, b) => b.n - a.n);

const totalCities = counts.size;
const qualified = ranked.length;
console.log(`\n🎯  CITY OPPORTUNITIES  ·  ${qualified} US cities with ≥${MIN} hotels  (of ${totalCities} cities with any inventory)\n` + "=".repeat(64));
console.log(`  ${"#".padStart(3)}  ${"hotels".padStart(6)}  city`);
ranked.slice(0, TOP).forEach((r, i) => {
  console.log(`  ${String(i + 1).padStart(3)}  ${String(r.n).padStart(6)}  ${r.city}${r.st ? `, ${r.st}` : ""}`);
});
console.log(`\nNext: Semrush-vet the candidates that look UNDER-COVERED (skip the obvious big-comp metros).`);
console.log(`Pick winnable ones — "where to stay in <city>" with decent volume + low KD — for the pilot batch.`);
console.log(`Each page is then a dedicated, researched post (real SERP + inventory), never a template.\n`);
