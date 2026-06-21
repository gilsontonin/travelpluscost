// Generic hotel CONTENT ingest from LiteAPI -> content/<region>.json
// Content (names, photos, descriptions, facilities) rarely changes, so we pull it once and
// serve it locally (instant, like static). Only live RATES are fetched at request time.
//
// Add a market: add an entry to REGIONS below, then run `node scripts/ingest.mjs <slug>`,
// then register the same region in src/lib/regions.ts + add it to DATASETS in src/lib/hotels.ts.
// Run: node scripts/ingest.mjs oahu   (needs LITEAPI_KEY in env)
import { writeFileSync, mkdirSync } from "node:fs";

// region slug -> { island (must match Region.name in regions.ts), countryCode, cities }
const REGIONS = {
  oahu: {
    island: "Oahu",
    countryCode: "US",
    cities: [
      { city: "Honolulu", limit: 50 },
      { city: "Kapolei", limit: 20 },
      { city: "Kailua", limit: 12 },
    ],
  },
  maui: {
    island: "Maui",
    countryCode: "US",
    cities: [
      { city: "Lahaina", limit: 20 },
      { city: "Kihei", limit: 20 },
      { city: "Wailea", limit: 10 },
    ],
  },
  lasvegas: {
    island: "Las Vegas",
    countryCode: "US",
    cities: [{ city: "Las Vegas", limit: 40 }],
  },
  seattle: {
    island: "Seattle",
    countryCode: "US",
    cities: [{ city: "Seattle", limit: 35 }],
  },
  sandiego: {
    island: "San Diego",
    countryCode: "US",
    cities: [{ city: "San Diego", limit: 35 }],
  },
};

const SLUG = (process.argv[2] || "oahu").toLowerCase();
const REGION = REGIONS[SLUG];
if (!REGION) {
  console.error(`Unknown region "${SLUG}". Known: ${Object.keys(REGIONS).join(", ")}`);
  process.exit(1);
}
const CITIES = REGION.cities;

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
if (!KEY) {
  console.error("Set LITEAPI_KEY (export from .env.local).");
  process.exit(1);
}
const h = { "X-API-Key": KEY, Accept: "application/json", "Content-Type": "application/json" };
const j = async (u, o) => {
  const r = await fetch(u, o);
  if (!r.ok) throw new Error(`${u} -> ${r.status}`);
  return r.json();
};

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function normFacilities(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((f) => (typeof f === "string" ? f : f?.name ?? "")).filter(Boolean);
}
// LiteAPI gives room size in m2; US audience wants sqft.
function toSqft(size, unit) {
  if (!size || typeof size !== "number") return null;
  return unit === "m2" ? Math.round(size * 10.7639) : Math.round(size);
}
// LiteAPI room.description is rich, structured HTML:
//   <p><strong>1 King Bed</strong></p><p>141-sq-foot room ...</p>
//   <p><b>Internet</b> - Free WiFi 50+ Mbps</p><p><b>Entertainment</b> - 42-inch LCD TV ...</p>
// Split into the "Label - value" feature bullets (the genuinely useful part) + a short summary.
function parseRoomDesc(html) {
  if (!html) return { summary: "", features: [] };
  const blocks = html
    .split(/<\/p>|<br\s*\/?>/i)
    .map((b) => stripHtml(b))
    .filter(Boolean);
  const features = [];
  let summary = "";
  for (const b of blocks) {
    if (/\s-\s/.test(b) && b.length < 220) features.push(b);
    else if (!summary && b.length < 160) summary = b;
  }
  return { summary, features: features.slice(0, 8) };
}
// rooms[] is the richest content we previously dropped: photos, size, beds, per-room amenities.
function normRooms(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const r of raw) {
    const name = (r.roomName ?? r.name ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue; // dedupe identical room names
    seen.add(key);
    const { summary, features } = parseRoomDesc(r.description);
    out.push({
      name,
      summary,
      features,
      view: (r.views ?? []).map((v) => v?.view).filter(Boolean)[0] ?? null,
      sqft: toSqft(r.roomSizeSquare, r.roomSizeUnit),
      sleeps: r.maxOccupancy ?? r.maxAdults ?? null,
      beds: (r.bedTypes ?? [])
        .map((b) => ({ qty: b.quantity ?? 1, type: (b.bedType ?? "").replace(/\s*bed$/i, "").trim() }))
        .filter((b) => b.type),
      amenities: (r.roomAmenities ?? r.amenities ?? [])
        .map((a) => (typeof a === "string" ? a : a?.name))
        .filter(Boolean)
        .slice(0, 12),
      photos: (r.photos ?? []).map((p) => p.hd_url || p.url).filter(Boolean).slice(0, 6),
    });
    if (out.length >= 40) break;
  }
  return out;
}
// Structured policies (Pets, Children, Groups, deposit…) — keep the ones with real text.
function normPolicies(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => ({ name: (p?.name ?? "").trim(), description: stripHtml(p?.description).trim() }))
    .filter((p) => p.name && p.description)
    .slice(0, 8);
}
async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          out[idx] = await fn(items[idx]);
        } catch (e) {
          out[idx] = null;
          console.error("  detail fail", items[idx].id, e.message);
        }
      }
    }),
  );
  return out;
}

const main = async () => {
  const seen = new Set();
  const list = [];
  for (const c of CITIES) {
    const res = await j(
      `${BASE}/data/hotels?countryCode=${REGION.countryCode}&cityName=${encodeURIComponent(c.city)}&limit=${c.limit}`,
      { headers: h },
    );
    const arr = res?.data ?? [];
    for (const x of arr) {
      if (!seen.has(x.id)) {
        seen.add(x.id);
        list.push(x);
      }
    }
    console.log(`${c.city}: ${arr.length} (running total ${list.length})`);
  }

  console.log(`fetching details for ${list.length} hotels...`);
  const details = await pool(list, 6, async (x) => {
    const r = await j(`${BASE}/data/hotel?hotelId=${x.id}`, { headers: h });
    const d = r?.data ?? r;
    const images = (d.hotelImages ?? []).map((im) => im.urlHd || im.url).filter(Boolean).slice(0, 30);
    return {
      id: d.id ?? x.id,
      name: d.name ?? x.name,
      island: REGION.island,
      city: d.city ?? x.city ?? "",
      address: d.address ?? x.address ?? "",
      stars: d.starRating ?? d.stars ?? x.stars ?? null,
      rating: d.rating ?? x.rating ?? null,
      reviewCount: d.reviewCount ?? x.reviewCount ?? null,
      image: x.main_photo || x.thumbnail || images[0] || "",
      images,
      facilities: normFacilities(d.hotelFacilities ?? d.facilities).slice(0, 40),
      description: stripHtml(d.hotelDescription).slice(0, 700),
      chain: d.chain || null,
      hotelType: d.hotelType || null,
      petsAllowed: typeof d.petsAllowed === "boolean" ? d.petsAllowed : null,
      childAllowed: typeof d.childAllowed === "boolean" ? d.childAllowed : null,
      importantInfo: stripHtml(d.hotelImportantInformation).slice(0, 1200) || null,
      policies: normPolicies(d.policies),
      reviewsUpdated: d.sentiment_updated_at ?? null,
      lat: d.location?.latitude ?? d.latitude ?? x.latitude ?? null,
      lng: d.location?.longitude ?? d.longitude ?? x.longitude ?? null,
      checkin: d.checkinCheckoutTimes?.checkin_start ?? null,
      checkout: d.checkinCheckoutTimes?.checkout ?? null,
      airportCode: d.airportCode ?? null,
      rooms: normRooms(d.rooms),
      sentiment: d.sentiment_analysis
        ? {
            categories: (d.sentiment_analysis.categories ?? [])
              .map((c) => ({ name: c.name, rating: c.rating }))
              .filter((c) => c.name && typeof c.rating === "number")
              .slice(0, 6),
            pros: (d.sentiment_analysis.pros ?? []).slice(0, 4),
            cons: (d.sentiment_analysis.cons ?? []).slice(0, 4),
          }
        : null,
    };
  });

  const hotels = details.filter(Boolean).filter((x) => x.image && x.name);
  mkdirSync("content", { recursive: true });
  writeFileSync(`content/${SLUG}.json`, JSON.stringify(hotels, null, 2));
  console.log(`✓ wrote content/${SLUG}.json with ${hotels.length} hotels`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
