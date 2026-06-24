// Backfill amenity flags onto the hotels directory so city hubs can group by amenity ("pool/spa
// hotels in {city}") without per-request API calls. For each hotel we fetch /data/hotel once, detect
// a small set of high-value amenities from its facilities, and store them in hotels.amenities (text[]).
//
// PREREQUISITE — run once in the Supabase SQL editor (see supabase/schema.sql):
//   alter table public.hotels add column if not exists amenities text[];
//   create index if not exists hotels_amenities_idx on public.hotels using gin (amenities);
//
// Run:
//   export $(grep -E '^(LITEAPI_KEY|LITEAPI_BASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY)=' .env.local | xargs)
//   node scripts/enrich-amenities.mjs --city "Las Vegas"   # one city (cheap — a demo slice)
//   node scripts/enrich-amenities.mjs US                   # all US (big: ~66k calls, hours)
//   node scripts/enrich-amenities.mjs US --redo            # re-fetch even already-enriched rows
//
// Resumable: by default only hotels with amenities IS NULL are fetched, so a re-run continues.
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
if (!KEY || !SB_URL || !SB_SECRET) {
  console.error("Missing LITEAPI_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in env.");
  process.exit(1);
}
const sb = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });
const h = { "X-API-Key": KEY, accept: "application/json" };

const args = process.argv.slice(2);
const redo = args.includes("--redo");
const cityIdx = args.indexOf("--city");
const city = cityIdx > -1 ? args[cityIdx + 1] : null;
const countries = args.filter((a, i) => !a.startsWith("--") && i !== cityIdx + 1).map((c) => c.toLowerCase());
const country = countries[0] || "us";

// High-value, query-worthy amenities → detected from the facilities text (mirrors lib/hotels.ts).
const MATCHERS = [
  ["Pool", /pool|swimming/i], ["Spa", /\bspa\b|sauna|massage/i], ["Gym", /gym|fitness/i],
  ["Free WiFi", /free wi-?fi/i], ["Parking", /parking/i], ["Breakfast", /breakfast/i],
  ["Restaurant", /restaurant|dining/i], ["Bar", /\bbar\b|lounge/i], ["Beachfront", /beach|oceanfront/i],
  ["Hot tub", /hot tub|jacuzzi|whirlpool/i], ["Pet-friendly", /\bpets?\b/i], ["Air conditioning", /air ?conditioning|\ba\/c\b/i],
  ["Airport shuttle", /shuttle|airport transfer/i], ["Kitchen", /kitchen/i], ["EV charging", /(electric|ev).{0,12}charg/i],
  ["Accessible", /accessible|wheelchair/i],
];
function detect(facilities) {
  const text = (facilities || []).map((f) => (typeof f === "string" ? f : f?.name ?? "")).join(" | ");
  return MATCHERS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

async function fetchJson(url, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: h, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (attempt >= tries) throw e;
      await new Promise((res) => setTimeout(res, 800 * attempt));
    }
  }
}

async function pool(items, n, fn) {
  const q = [...items];
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, q.length) }, async () => {
      for (;;) {
        const item = q.shift();
        if (!item) return;
        await fn(item);
        if (++done % 200 === 0) process.stdout.write(`\r  enriched ${done}/${items.length}…   `);
      }
    }),
  );
}

// Pull the target hotel ids (keyset paginated). Only un-enriched unless --redo.
async function targetIds() {
  const ids = [];
  let cursor = null;
  for (;;) {
    let q = sb.from("hotels").select("id").eq("country", country).eq("kind", "hotel").order("id", { ascending: true }).limit(1000);
    if (city) q = q.ilike("city", city);
    if (!redo) q = q.is("amenities", null);
    if (cursor) q = q.gt("id", cursor);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    if (!data.length) break;
    ids.push(...data.map((r) => r.id));
    cursor = data[data.length - 1].id;
    if (data.length < 1000) break;
  }
  return ids;
}

const ids = await targetIds();
console.log(`enrich-amenities: ${ids.length} hotels ${city ? `in ${city}` : country.toUpperCase()}${redo ? " (redo)" : " (missing only)"}`);
if (!ids.length) process.exit(0);

let ok = 0;
await pool(ids, 12, async (id) => {
  try {
    const j = await fetchJson(`${BASE}/data/hotel?hotelId=${id}`);
    const d = j?.data ?? j;
    const amenities = detect(d?.facilities ?? d?.hotelFacilities ?? []);
    const { error } = await sb.from("hotels").update({ amenities }).eq("id", id);
    if (!error) ok++;
  } catch {
    /* skip — leave NULL so a later run retries */
  }
});
console.log(`\n✓ enriched ${ok}/${ids.length} hotels.`);
