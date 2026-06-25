// Bulk amenity backfill — populates hotels.amenities (text[]) for the whole directory CHEAPLY.
//
// Why this instead of enrich-amenities.mjs: the per-hotel version does one /data/hotel call PER hotel
// (~65k calls, hours). /data/hotels returns `facilityIds` in BULK (up to 1000 hotels/call), and
// /data/facilities maps each id → a name. So we resolve facilityIds → a small canonical amenity set in
// ~one pass over the US list (~275 calls) + ~65 batched upserts. Same 16-amenity taxonomy as the
// per-hotel script, so the two are interchangeable.
//
// PREREQUISITE (run once in the Supabase SQL editor — this script CANNOT run DDL):
//   alter table public.hotels add column if not exists amenities text[];
//   create index if not exists hotels_amenities_idx on public.hotels using gin (amenities);
//
// Run:
//   node --env-file=.env.local scripts/enrich-amenities-bulk.mjs            # all US (missing only)
//   node --env-file=.env.local scripts/enrich-amenities-bulk.mjs --redo     # re-map every row
//   node --env-file=.env.local scripts/enrich-amenities-bulk.mjs --dry      # no writes, just report
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
if (!KEY || !SB_URL || !SB_SECRET) { console.error("Missing LITEAPI_KEY / SUPABASE env."); process.exit(1); }
const sb = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });
const H = { "X-API-Key": KEY, accept: "application/json" };

const args = process.argv.slice(2);
const REDO = args.includes("--redo");
const DRY = args.includes("--dry");
const COUNTRY = (args.find((a) => !a.startsWith("--")) || "US").toUpperCase();

// Canonical, query-worthy amenities — matched against each facility's NAME (mirrors enrich-amenities.mjs
// + lib/hotels.ts; keep the three in sync).
const MATCHERS = [
  ["Pool", /\bpool\b(?! ?table)|swimming/i], ["Spa", /\bspa\b|sauna|massage/i], ["Gym", /gym|fitness/i],
  ["Free WiFi", /free wi-?fi/i], ["Parking", /parking/i], ["Breakfast", /breakfast/i],
  ["Restaurant", /restaurant|dining/i], ["Bar", /\bbar\b|lounge/i],
  // True beachfront ONLY — the old /beach/ matched "beach towels/shuttle/club nearby/volleyball" and
  // mis-tagged 20% of hotels (incl. landlocked Sedona/Vegas). Now: on/direct-access/private-beach-area.
  ["Beachfront", /beachfront|oceanfront|on (a |the )?private beach\b|direct access to[\w' -]*\bbeach\b|private beach area/i],
  ["Hot tub", /hot tub|jacuzzi|whirlpool/i], ["Pet-friendly", /\bpets?\b/i], ["Air conditioning", /air ?conditioning|\ba\/c\b/i],
  ["Airport shuttle", /shuttle|airport transfer/i], ["Kitchen", /kitchen/i], ["EV charging", /(electric|ev).{0,12}charg/i],
  ["Accessible", /accessible|wheelchair/i],
];

async function getJson(url, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: H, signal: AbortSignal.timeout(25000) });
      if (r.status === 429) throw new Error("429");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (attempt >= tries) throw e;
      await new Promise((res) => setTimeout(res, 700 * attempt));
    }
  }
}

// 1) facility_id → [canonical amenity] from the 814-facility reference.
const fref = await getJson(`${BASE}/data/facilities`);
const id2amen = new Map();
for (const f of fref?.data ?? []) {
  const hits = MATCHERS.filter(([, re]) => re.test(f.facility ?? "")).map(([a]) => a);
  if (hits.length) id2amen.set(f.facility_id, hits);
}
console.log(`facilities: ${(fref?.data ?? []).length} → ${id2amen.size} resolve to a canonical amenity`);

// 2) the set of directory ids we own (only these get written; never INSERT a stray row).
async function directoryIds() {
  const ids = new Set();
  let cursor = null;
  for (;;) {
    let q = sb.from("hotels").select("id,amenities").eq("country", COUNTRY.toLowerCase()).eq("kind", "hotel").order("id", { ascending: true }).limit(1000);
    if (cursor) q = q.gt("id", cursor);
    const { data, error } = await q;
    if (error) { console.error("Supabase read failed:", error.message, "\n→ has the `amenities` column been created? (see header)"); process.exit(1); }
    if (!data.length) break;
    for (const r of data) if (REDO || r.amenities == null) ids.add(r.id);
    cursor = data[data.length - 1].id;
    if (data.length < 1000) break;
  }
  return ids;
}
const targets = await directoryIds();
console.log(`directory rows to fill (${REDO ? "all" : "missing only"}): ${targets.size}`);
if (!targets.size) { console.log("nothing to do."); process.exit(0); }

// 3) page the bulk hotel list; resolve facilityIds → amenities for ids we own.
const updates = new Map(); // id → amenities[]
const LIMIT = 1000;
const first = await getJson(`${BASE}/data/hotels?countryCode=${COUNTRY}&limit=1&offset=0`);
const total = first?.total ?? 0;
console.log(`bulk /data/hotels total for ${COUNTRY}: ${total} (≈${Math.ceil(total / LIMIT)} pages)`);

let scanned = 0;
for (let offset = 0; offset < total; offset += LIMIT) {
  let page;
  try { page = await getJson(`${BASE}/data/hotels?countryCode=${COUNTRY}&limit=${LIMIT}&offset=${offset}`); }
  catch (e) { console.log(`\n  page @${offset} failed (${e.message}) — skipping`); continue; }
  const arr = page?.data ?? [];
  if (!arr.length) break;
  for (const ht of arr) {
    scanned++;
    if (!targets.has(ht.id)) continue;
    const amen = [...new Set((ht.facilityIds || []).flatMap((id) => id2amen.get(id) || []))];
    updates.set(ht.id, amen);
  }
  process.stdout.write(`\r  scanned ${scanned}/${total} · matched ${updates.size}/${targets.size}   `);
}
console.log(`\nmatched ${updates.size} of ${targets.size} target rows.`);

if (DRY) {
  const sample = [...updates.entries()].slice(0, 8).map(([id, a]) => `${id}:[${a.join(",")}]`);
  console.log("DRY RUN — no writes. sample:\n  " + sample.join("\n  "));
  process.exit(0);
}

// 4) batched writes — group ids by identical amenity signature, then UPDATE ... IN(...) per group.
// Pure UPDATE (never INSERT) so we can't create stray rows or trip a NOT NULL on an unprovided column,
// and grouping collapses 65k rows into a few hundred calls (the amenity set is small + repetitive).
const bySig = new Map(); // signature → { amenities, ids[] }
for (const [id, amen] of updates) {
  const sig = JSON.stringify(amen);
  (bySig.get(sig) ?? bySig.set(sig, { amenities: amen, ids: [] }).get(sig)).ids.push(id);
}
console.log(`${bySig.size} distinct amenity combinations`);
let wrote = 0;
for (const { amenities, ids } of bySig.values()) {
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200); // small chunks — GIN index on amenities makes big UPDATEs hit the statement timeout
    for (let attempt = 1; ; attempt++) {
      const { error } = await sb.from("hotels").update({ amenities }).in("id", chunk);
      if (!error) break;
      if (attempt >= 4) { console.error("\nupdate failed after retries:", error.message); process.exit(1); }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
    wrote += chunk.length;
    process.stdout.write(`\r  wrote ${wrote}/${updates.size}   `);
  }
}
console.log(`\n✓ backfilled amenities on ${wrote} hotels.`);
