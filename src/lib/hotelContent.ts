// Rich hotel CONTENT for the property page — for ANY hotel id, at request time. Scales to 3M.
// Curated markets (bundled JSON) return instantly; every other hotel is fetched live from LiteAPI
// /data/hotel, normalized to the Hotel shape, and cached in-memory (~1h). This is the "full content
// on demand" half of the scale model — the directory holds only the thin index. Server-only.
import type { Hotel, Room } from "./hotels";
import { getHotel } from "./hotels";
import { getHotelDetails } from "./liteapi";

const TTL = 60 * 60 * 1000; // content rarely changes
const cache = new Map<string, { value: Hotel | null; exp: number }>();

function stripHtml(html?: string): string {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function toSqft(size?: number, unit?: string): number | null {
  if (!size || typeof size !== "number") return null;
  const sqft = unit === "m2" ? Math.round(size * 10.7639) : Math.round(size);
  return sqft >= 70 ? sqft : null; // drop bogus sub-70-sqft sizes (mislabelled units)
}
function parseRoomDesc(html?: string): { summary: string; features: string[] } {
  if (!html) return { summary: "", features: [] };
  const blocks = html.split(/<\/p>|<br\s*\/?>/i).map(stripHtml).filter(Boolean);
  const features: string[] = [];
  let summary = "";
  for (const b of blocks) {
    if (/\s-\s/.test(b) && b.length < 220) features.push(b);
    else if (!summary && b.length < 160) summary = b;
  }
  return { summary, features: features.slice(0, 8) };
}

interface RawRoom {
  id?: number;
  roomName?: string;
  name?: string;
  description?: string;
  views?: { view?: string }[];
  roomSizeSquare?: number;
  roomSizeUnit?: string;
  maxOccupancy?: number;
  maxAdults?: number;
  bedTypes?: { quantity?: number; bedType?: string }[];
  roomAmenities?: ({ name?: string } | string)[];
  amenities?: ({ name?: string } | string)[];
  photos?: { url?: string; hd_url?: string }[];
}
function normRooms(raw?: RawRoom[]): Room[] {
  if (!Array.isArray(raw)) return [];
  const byName = new Map<string, Room>();
  for (const r of raw) {
    const name = (r.roomName ?? r.name ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const id = typeof r.id === "number" ? r.id : null;
    const ex = byName.get(key);
    if (ex) {
      if (id != null) (ex.ids ??= []).push(id);
      continue;
    }
    if (byName.size >= 40) continue;
    const { summary, features } = parseRoomDesc(r.description);
    byName.set(key, {
      ids: id != null ? [id] : [],
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
        .slice(0, 12) as string[],
      photos: (r.photos ?? []).map((p) => p.hd_url || p.url).filter(Boolean).slice(0, 6) as string[],
    });
  }
  return [...byName.values()];
}
function normFacilities(raw?: (string | { name?: string })[]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((f) => (typeof f === "string" ? f : f?.name ?? "")).filter(Boolean);
}
function normPolicies(raw?: { name?: string; description?: string }[]): { name: string; description: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => ({ name: (p?.name ?? "").trim(), description: stripHtml(p?.description).trim() }))
    .filter((p) => p.name && p.description);
}

interface RawDetail {
  id?: string;
  name?: string;
  city?: string;
  country?: string;
  address?: string;
  starRating?: number;
  stars?: number;
  rating?: number;
  reviewCount?: number;
  hotelImages?: { url?: string; urlHd?: string }[];
  hotelFacilities?: (string | { name?: string })[];
  facilities?: { name?: string }[];
  hotelDescription?: string;
  chain?: string;
  hotelType?: string;
  petsAllowed?: boolean;
  childAllowed?: boolean;
  hotelImportantInformation?: string;
  policies?: { name?: string; description?: string }[];
  sentiment_updated_at?: string;
  location?: { latitude?: number; longitude?: number };
  latitude?: number;
  longitude?: number;
  checkinCheckoutTimes?: { checkin?: string; checkin_start?: string; checkout?: string };
  rooms?: RawRoom[];
  sentiment_analysis?: { categories?: { name?: string; rating?: number }[]; pros?: string[]; cons?: string[] };
}

function mapDetail(d: RawDetail): Hotel {
  const images = (d.hotelImages ?? []).map((im) => im.urlHd || im.url).filter(Boolean).slice(0, 30) as string[];
  const sa = d.sentiment_analysis;
  return {
    id: d.id ?? "",
    name: d.name ?? "",
    island: d.city ?? "", // generic location; region/landmark logic is handled by the page
    city: d.city ?? "",
    address: d.address ?? "",
    stars: d.starRating ?? d.stars ?? null,
    rating: d.rating ?? null,
    reviewCount: d.reviewCount ?? null,
    image: images[0] ?? "",
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
    airportCode: null,
    lat: d.location?.latitude ?? d.latitude ?? null,
    lng: d.location?.longitude ?? d.longitude ?? null,
    checkin: d.checkinCheckoutTimes?.checkin_start ?? d.checkinCheckoutTimes?.checkin ?? null,
    checkout: d.checkinCheckoutTimes?.checkout ?? null,
    rooms: normRooms(d.rooms),
    sentiment: sa
      ? {
          categories: (sa.categories ?? [])
            .map((c) => ({ name: c.name as string, rating: c.rating as number }))
            .filter((c) => c.name && typeof c.rating === "number")
            .slice(0, 6),
          pros: (sa.pros ?? []).slice(0, 4),
          cons: (sa.cons ?? []).slice(0, 4),
        }
      : null,
    reviews: [], // individual reviews are only ingested for curated markets; sentiment still shows
  };
}

/** Rich content for any hotel: curated JSON first, else live LiteAPI content (cached). */
export async function getHotelContent(id: string): Promise<Hotel | null> {
  const curated = getHotel(id);
  if (curated) return curated;

  const hit = cache.get(id);
  if (hit && hit.exp > Date.now()) return hit.value;

  let value: Hotel | null = null;
  try {
    const resp = (await getHotelDetails(id)) as { data?: RawDetail } | RawDetail;
    const d = (resp as { data?: RawDetail })?.data ?? (resp as RawDetail);
    if (d && d.name) value = mapDetail(d);
  } catch {
    value = null;
  }
  cache.set(id, { value, exp: Date.now() + TTL });
  return value;
}
