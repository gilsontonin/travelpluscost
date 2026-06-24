#!/usr/bin/env node
// Backfill the directory `pros` column — LiteAPI AI-sentiment highlights ("Friendly staff", "Great
// location") for a city's hotels, so blog/search/property cards can show honest social proof SERVER-SIDE
// (no per-page LiteAPI calls). Lazy + per-city, exactly like the rate-check: only backfill the cities you
// actually write about, so it scales to the 3,000-city program without crawling the whole directory.
//
// PREREQ (one-time, run in the Supabase SQL editor):
//     alter table hotels add column if not exists pros text[];
//
// Usage:  npm run blog:pros -- branson            # backfill hotels missing pros (top ~80 by reviews)
//         npm run blog:pros -- branson --all      # refetch even hotels that already have pros
//         npm run blog:pros -- "pigeon forge" --limit=120

import { createClient } from "@supabase/supabase-js";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, SECRET = process.env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error("✗ Set LITEAPI_KEY in .env.local"); process.exit(1); }
if (!URL || !SECRET) { console.error("✗ Missing Supabase env — run via `npm run blog:pros` (loads .env.local)."); process.exit(1); }
const sb = createClient(URL, SECRET, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const REFRESH = args.includes("--all");
const LIMIT = Number((args.find((a) => a.startsWith("--limit=")) || "").split("=")[1]) || 80;
const city = args.filter((a) => !a.startsWith("--")).join(" ").trim();
if (!city) { console.error("usage: npm run blog:pros -- <city>"); process.exit(1); }

const h = { "X-API-Key": KEY, accept: "application/json" };
const j = async (u) => { const r = await fetch(u, { headers: h }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); };
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  const work = async () => { while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]); } catch (e) { out[k] = { err: e.message }; } } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, work));
  return out;
}

const { data, error } = await sb.from("hotels")
  .select("id,name,pros").eq("country", "us").ilike("city", city).eq("kind", "hotel")
  .order("review_count", { ascending: false }).limit(LIMIT);
if (error) { console.error(`✗ ${error.message}\n   (did you run:  alter table hotels add column if not exists pros text[];  ?)`); process.exit(1); }
if (!data?.length) { console.error(`✗ No hotels for "${city}" in the directory.`); process.exit(1); }

const todo = data.filter((x) => REFRESH || !(Array.isArray(x.pros) && x.pros.length));
console.log(`\n🗣  PROS backfill — ${city}: ${data.length} hotels, ${todo.length} to fetch${REFRESH ? " (--all)" : " (skipping already-set)"}…`);

const results = await pool(todo, 6, async (x) => {
  const r = await j(`${BASE}/data/hotel?hotelId=${x.id}`);
  const d = r?.data ?? r;
  const pros = (d?.sentiment_analysis?.pros ?? []).map((s) => String(s).trim()).filter(Boolean).slice(0, 3);
  if (!pros.length) return { none: true };
  const { error: ue } = await sb.from("hotels").update({ pros }).eq("id", x.id);
  return ue ? { err: ue.message } : { set: true };
});

const set = results.filter((r) => r?.set).length;
const none = results.filter((r) => r?.none).length;
const failed = results.filter((r) => r?.err).length;
console.log(`   ✓ ${set} updated · ${none} had no sentiment yet · ${failed} failed.`);
if (failed) console.log(`   first error: ${results.find((r) => r?.err)?.err}`);
console.log("");
