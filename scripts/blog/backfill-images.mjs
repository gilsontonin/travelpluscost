#!/usr/bin/env node
// Backfill the directory `images` column — up to 6 LiteAPI photos per hotel (hero first), so blog
// SHOWCASE cards can render a swipable gallery SERVER-SIDE (no per-page LiteAPI calls, no client fetch).
// Lazy + per-city, exactly like blog:pros / the rate-check: only backfill the cities you write about,
// so it scales to the 3,000-city program without crawling the whole directory.
//
// PREREQ (one-time, run in the Supabase SQL editor):
//     alter table hotels add column if not exists images text[];
//
// Usage:  npm run blog:images -- sedona            # backfill hotels missing images (top ~80 by reviews)
//         npm run blog:images -- sedona --all      # refetch even hotels that already have images
//         npm run blog:images -- "pigeon forge" --limit=120

import { createClient } from "@supabase/supabase-js";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, SECRET = process.env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error("✗ Set LITEAPI_KEY in .env.local"); process.exit(1); }
if (!URL || !SECRET) { console.error("✗ Missing Supabase env — run via `npm run blog:images` (loads .env.local)."); process.exit(1); }
const sb = createClient(URL, SECRET, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const REFRESH = args.includes("--all");
const LIMIT = Number((args.find((a) => a.startsWith("--limit=")) || "").split("=")[1]) || 80;
const city = args.filter((a) => !a.startsWith("--")).join(" ").trim();
if (!city) { console.error("usage: npm run blog:images -- <city>"); process.exit(1); }

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
  .select("id,name,images").eq("country", "us").ilike("city", city).eq("kind", "hotel")
  .order("review_count", { ascending: false }).limit(LIMIT);
if (error) { console.error(`✗ ${error.message}\n   (did you run:  alter table hotels add column if not exists images text[];  ?)`); process.exit(1); }
if (!data?.length) { console.error(`✗ No hotels for "${city}" in the directory.`); process.exit(1); }

const todo = data.filter((x) => REFRESH || !(Array.isArray(x.images) && x.images.length));
console.log(`\n🖼  IMAGES backfill — ${city}: ${data.length} hotels, ${todo.length} to fetch${REFRESH ? " (--all)" : " (skipping already-set)"}…`);

const results = await pool(todo, 6, async (x) => {
  const r = await j(`${BASE}/data/hotel?hotelId=${x.id}`);
  const d = r?.data ?? r;
  // Mirror lib/hotelContent.ts: prefer HD url, lead with the flagged hero (defaultImage:true), cap at 6.
  const raw = (d?.hotelImages ?? []).filter((im) => im?.urlHd || im?.url);
  const di = raw.findIndex((im) => im?.defaultImage);
  if (di > 0) raw.unshift(raw.splice(di, 1)[0]);
  const images = raw.map((im) => im.urlHd || im.url).filter(Boolean).slice(0, 6);
  if (!images.length) return { none: true };
  const { error: ue } = await sb.from("hotels").update({ images }).eq("id", x.id);
  return ue ? { err: ue.message } : { set: true };
});

const set = results.filter((r) => r?.set).length;
const none = results.filter((r) => r?.none).length;
const failed = results.filter((r) => r?.err).length;
console.log(`   ✓ ${set} updated · ${none} had no photos · ${failed} failed.`);
if (failed) console.log(`   first error: ${results.find((r) => r?.err)?.err}`);
console.log("");
