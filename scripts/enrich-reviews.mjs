// Backfill individual guest reviews onto existing content/<slug>.json files.
// NON-DESTRUCTIVE: only sets each hotel's `reviews` field; every other field is left untouched.
// Source: LiteAPI /data/reviews (the same data behind the AI sentiment we already show).
//
// Run: export $(grep '^LITEAPI_KEY=' .env.local | xargs) && node scripts/enrich-reviews.mjs
//      node scripts/enrich-reviews.mjs oahu maui   # specific regions only
//
// Sentiment (the summary) comes from /data/hotel during ingest; this adds the raw reviews.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
if (!KEY) {
  console.error("Set LITEAPI_KEY (export from .env.local).");
  process.exit(1);
}
const h = { "X-API-Key": KEY, accept: "application/json" };

const ALL = ["oahu", "maui", "lasvegas", "seattle", "sandiego"];
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ALL;

const PER_HOTEL = 6; // how many reviews to keep per hotel

const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const tidyType = (t) => clean(t).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Trim to <= n chars on a word boundary, adding an ellipsis only when actually cut.
function trunc(s, n) {
  const t = clean(s);
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.!-]+$/, "") + "…";
}

// Run `fn` over `items` with at most `n` in flight.
async function pool(items, n, fn) {
  const q = [...items.entries()];
  const workers = Array.from({ length: Math.min(n, q.length) }, async () => {
    for (;;) {
      const next = q.shift();
      if (!next) return;
      await fn(next[1]);
    }
  });
  await Promise.all(workers);
}

// Keep English reviews that actually have text; richest (both pros+cons) and most recent first.
function pickReviews(raw) {
  const eng = raw.filter((r) => (r.language ?? "").toLowerCase().startsWith("en"));
  const withText = eng.filter((r) => clean(r.pros) || clean(r.cons) || clean(r.headline));
  withText.sort((a, b) => {
    const ra = (clean(a.pros) ? 1 : 0) + (clean(a.cons) ? 1 : 0);
    const rb = (clean(b.pros) ? 1 : 0) + (clean(b.cons) ? 1 : 0);
    if (rb !== ra) return rb - ra;
    return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime();
  });
  return withText.slice(0, PER_HOTEL).map((r) => ({
    name: clean(r.name) || "Guest",
    date: r.date ? String(r.date).slice(0, 10) : null,
    score: typeof r.averageScore === "number" ? r.averageScore : null,
    type: r.type ? tidyType(r.type) : null,
    headline: trunc(r.headline, 140),
    pros: trunc(r.pros, 300),
    cons: trunc(r.cons, 300),
  }));
}

async function run(slug) {
  const file = `content/${slug}.json`;
  if (!existsSync(file)) {
    console.warn(`skip ${slug}: ${file} not found`);
    return;
  }
  const hotels = JSON.parse(readFileSync(file, "utf8"));
  let withReviews = 0;
  let total = 0;
  await pool(hotels, 6, async (hotel) => {
    try {
      const r = await fetch(`${BASE}/data/reviews?hotelId=${hotel.id}&limit=40&timeout=6`, { headers: h });
      if (!r.ok) {
        hotel.reviews = hotel.reviews ?? [];
        return;
      }
      const j = await r.json();
      const picks = pickReviews(j.data ?? []);
      hotel.reviews = picks;
      if (picks.length) {
        withReviews++;
        total += picks.length;
      }
    } catch {
      hotel.reviews = hotel.reviews ?? [];
    }
  });
  writeFileSync(file, JSON.stringify(hotels, null, 2));
  console.log(`✓ ${slug}: ${withReviews}/${hotels.length} hotels got reviews (${total} total)`);
}

for (const slug of targets) {
  await run(slug);
}
