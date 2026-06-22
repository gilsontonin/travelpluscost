// Fill the hotels DIRECTORY from LiteAPI's hotel list. Thin records only (id, name, city, geo,
// stars, rating, thumbnail) — full content + live rates are fetched on the property page, never
// mirrored here. US first (~274k); the same script does any country, then the world.
//
//   export $(grep -E '^(LITEAPI_KEY|LITEAPI_BASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY)=' .env.local | xargs)
//   node scripts/ingest-directory.mjs US              # all US hotels
//   node scripts/ingest-directory.mjs US --max 1000   # quick test slice
//   node scripts/ingest-directory.mjs GB FR ES        # other countries

import { createClient } from "@supabase/supabase-js";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
if (!KEY || !SB_URL || !SB_SECRET) {
  console.error("Missing LITEAPI_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in env.");
  process.exit(1);
}

const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max");
const MAX = maxIdx > -1 ? parseInt(args[maxIdx + 1], 10) : Infinity;
const countries = args.filter((a, i) => !a.startsWith("--") && i !== maxIdx + 1).map((c) => c.toUpperCase());
if (!countries.length) countries.push("US");

const sb = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });
const h = { "X-API-Key": KEY, accept: "application/json" };
const PAGE = 1000;
const BATCH = 500;

const slugify = (s) =>
  (s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

// LiteAPI hotelTypeId → our category (hotel vs vacation rental) + a display label. Verified by
// resolving each id against /data/hotel. Hotels lead search; rentals are real inventory but rank below.
// "Real hotels only" policy: only these 7 types are shown (kind 'hotel'); everything else —
// apartments, villas, homes, condos, B&Bs, guesthouses, and anything UNRECOGNIZED — is 'rental'
// and hidden from search. Default-exclude so junk inventory can't leak in.
const TYPE_MAP = {
  204: ["hotel", "Hotel"], 206: ["hotel", "Resort"], 218: ["hotel", "Inn"], 205: ["hotel", "Motel"],
  221: ["hotel", "Lodge"], 219: ["hotel", "Aparthotel"], 264: ["hotel", "Hostel"],
  208: ["rental", "B&B"], 216: ["rental", "Guesthouse"], 277: ["rental", ""],
  201: ["rental", "Apartment"], 220: ["rental", "Holiday home"], 213: ["rental", "Villa"],
  229: ["rental", "Condo"], 250: ["rental", "Vacation home"], 230: ["rental", "Cottage"],
  222: ["rental", "Homestay"], 228: ["rental", "Chalet"], 207: ["rental", "Residence"], 254: ["rental", "Campsite"],
};
function classify(typeId) {
  return TYPE_MAP[typeId] ?? ["rental", ""]; // unrecognized → excluded from search
}

function mapHotel(x, country) {
  const [kind, propertyType] = classify(x.hotelTypeId);
  return {
    id: x.id,
    name: x.name,
    slug: `${slugify(x.name)}-${x.id}`,
    city: x.city || null,
    state: null, // not in the list response — enriched later for state-level SEO
    country: (x.country || country).toLowerCase(),
    lat: typeof x.latitude === "number" ? x.latitude : null,
    lng: typeof x.longitude === "number" ? x.longitude : null,
    stars: x.stars ?? null,
    rating: x.rating ?? null,
    review_count: x.reviewCount ?? null,
    // Store the FULL-RES main_photo (not the small thumbnail): cards stretch the image across ~42%
    // of the card, where the thumbnail looked soft upscaled. Next/image downscales main_photo to a
    // crisp card-sized image. Falls back to thumbnail if a hotel has no main_photo.
    thumbnail: x.main_photo || x.thumbnail || null,
    kind,
    property_type: propertyType || null,
  };
}

async function flush(buffer) {
  if (!buffer.length) return;
  const { error } = await sb.from("hotels").upsert(buffer, { onConflict: "id" });
  if (error) throw new Error("supabase upsert: " + error.message);
}

async function ingestCountry(country) {
  let offset = 0;
  let total = null;
  let count = 0;
  let buffer = [];
  console.log(`\n${country}: ingesting (cap ${MAX === Infinity ? "all" : MAX})…`);
  for (;;) {
    const url = `${BASE}/data/hotels?countryCode=${country}&limit=${PAGE}&offset=${offset}&timeout=10`;
    const r = await fetch(url, { headers: h });
    if (!r.ok) throw new Error(`hotels ${r.status} at offset ${offset}`);
    const j = await r.json();
    const list = (j.data || []).filter((x) => x && x.id && x.name && !x.deletedAt);
    if (total === null) total = j.total ?? list.length;
    if (!list.length) break;
    for (const x of list) {
      buffer.push(mapHotel(x, country));
      if (buffer.length >= BATCH) {
        await flush(buffer);
        count += buffer.length;
        buffer = [];
        process.stdout.write(`\r  ${count} upserted (offset ${offset + PAGE}/${total})   `);
      }
    }
    offset += PAGE;
    if (offset >= total || count >= MAX) break;
  }
  await flush(buffer);
  count += buffer.length;
  console.log(`\r✓ ${country}: ${count} hotels in the directory${" ".repeat(20)}`);
  return count;
}

(async () => {
  let grand = 0;
  for (const c of countries) grand += await ingestCountry(c);
  console.log(`\nTotal directory rows added/updated: ${grand}`);
})().catch((e) => {
  console.error("\nERR", e.message);
  process.exit(1);
});
