// Fill hotels.state by reverse-geocoding each hotel's lat/lng against US state polygons — offline
// point-in-polygon, no API cost. The bulk feed has no state field and zip/address cover only ~12%
// of US hotels, so coordinates (which we already store, ~fully populated) are the reliable source.
// Run AFTER an ingest (the ingest no longer writes the state column, so it won't clobber this).
// Idempotent. State is stored as the 2-letter USPS code (e.g. "TX") → the "City, TX" autocomplete.
//
//   export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY)=' .env.local | xargs)
//   node scripts/enrich-state.mjs           # enrich all US rows
//   node scripts/enrich-state.mjs --test    # verify known points only, no DB writes

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const geo = JSON.parse(readFileSync(join(__dirname, "us-states.geojson"), "utf8"));

const NAME_TO_ABBR = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
  Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY",
  Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI",
  "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "Puerto Rico": "PR",
};

// ── Point-in-polygon (ray casting). GeoJSON coords are [lng, lat]. ──
function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function pointInPolygon(lng, lat, rings) {
  if (!pointInRing(lng, lat, rings[0])) return false;        // outside the outer ring
  for (let k = 1; k < rings.length; k++) if (pointInRing(lng, lat, rings[k])) return false; // in a hole
  return true;
}
function pointInGeom(lng, lat, geom) {
  if (geom.type === "Polygon") return pointInPolygon(lng, lat, geom.coordinates);
  if (geom.type === "MultiPolygon") return geom.coordinates.some((poly) => pointInPolygon(lng, lat, poly));
  return false;
}
function bboxOf(geom) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const scan = (c) => {
    if (typeof c[0] === "number") {
      if (c[0] < minX) minX = c[0]; if (c[0] > maxX) maxX = c[0];
      if (c[1] < minY) minY = c[1]; if (c[1] > maxY) maxY = c[1];
    } else for (const x of c) scan(x);
  };
  scan(geom.coordinates);
  return [minX, minY, maxX, maxY];
}

const FEATURES = geo.features
  .map((f) => ({ abbr: NAME_TO_ABBR[f.properties?.name ?? f.properties?.NAME], geom: f.geometry, bbox: bboxOf(f.geometry) }))
  .filter((f) => f.abbr && f.geom);

function stateOf(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  for (const f of FEATURES) {
    const [minX, minY, maxX, maxY] = f.bbox;
    if (lng < minX || lng > maxX || lat < minY || lat > maxY) continue; // bbox pre-filter
    if (pointInGeom(lng, lat, f.geom)) return f.abbr;
  }
  // Hawaii is a remote archipelago; simplified polygons miss its small islands, but nothing else US
  // is in the mid-Pacific — so a bounding box is a safe, exact fallback for the core market.
  if (lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154) return "HI";
  return null;
}

// ── --test: verify known points, no DB ──
if (process.argv.includes("--test")) {
  const cases = [
    ["Honolulu", 21.3069, -157.8583, "HI"],
    ["Lahaina (Maui)", 20.8783, -156.6825, "HI"],
    ["Austin", 30.2672, -97.7431, "TX"],
    ["New York", 40.7128, -74.006, "NY"],
    ["Anchorage", 61.2181, -149.9003, "AK"],
    ["Chicago", 41.8781, -87.6298, "IL"],
    ["Las Vegas", 36.1699, -115.1398, "NV"],
    ["Miami Beach", 25.7907, -80.13, "FL"],
    ["Santa Monica", 34.0195, -118.4912, "CA"],
    ["Key West", 24.5551, -81.78, "FL"],
    ["Virginia Beach", 36.8529, -75.978, "VA"],
    ["Galveston", 29.3013, -94.7977, "TX"],
    ["Myrtle Beach", 33.6891, -78.8867, "SC"],
    ["Provincetown", 42.0584, -70.1787, "MA"],
  ];
  let ok = 0;
  for (const [name, lat, lng, want] of cases) {
    const got = stateOf(lat, lng);
    const pass = got === want;
    if (pass) ok++;
    console.log(`${pass ? "✓" : "✗"} ${name}: ${got ?? "null"} (want ${want})`);
  }
  console.log(`\n${ok}/${cases.length} correct · ${FEATURES.length} state polygons loaded`);
  process.exit(ok === cases.length ? 0 : 1);
}

// ── DB enrichment ──
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
if (!SB_URL || !SB_SECRET) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in env.");
  process.exit(1);
}
const sb = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });
const PAGE = 1000;
const BATCH = 500;

async function flush(buffer) {
  if (!buffer.length) return;
  const { error } = await sb.from("hotels").upsert(buffer, { onConflict: "id" });
  if (error) throw new Error("supabase upsert: " + error.message);
}

(async () => {
  let from = 0;
  let scanned = 0;
  let set = 0;
  let buffer = [];
  console.log("Enriching state from lat/lng (US rows)…");
  for (;;) {
    const { data, error } = await sb
      .from("hotels")
      .select("id,name,lat,lng")
      .eq("country", "us")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error("supabase select: " + error.message);
    if (!data.length) break;
    for (const r of data) {
      scanned++;
      const st = stateOf(r.lat, r.lng);
      if (!st) continue; // can't place it → leave state null
      buffer.push({ id: r.id, name: r.name, state: st }); // name satisfies NOT NULL on the upsert path
      if (buffer.length >= BATCH) {
        await flush(buffer);
        set += buffer.length;
        buffer = [];
        process.stdout.write(`\r  scanned ${scanned} · state set ${set}   `);
      }
    }
    from += PAGE;
  }
  await flush(buffer);
  set += buffer.length;
  console.log(`\r✓ done — scanned ${scanned}, state set on ${set}${" ".repeat(20)}`);
})().catch((e) => {
  console.error("\nERR", e.message);
  process.exit(1);
});
