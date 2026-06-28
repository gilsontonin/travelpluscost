// Viator "things to do" — on-demand product search, geotagged to a hotel via the nearest Viator
// destination. Basic-access key: no bulk catalog mirror (/products/modified-since is 403), so we
// search live per destination and cache. Cards deep-link to Viator's productUrl, which already
// carries the partner tracking (~8% commission). Server-only.
import destinations from "./viatorDestinations.json";

export interface Activity {
  code: string;
  title: string;
  image: string;
  rating: number | null;
  reviews: number | null;
  durationMin: number | null;
  fromPrice: number | null;
  currency: string;
  url: string; // Viator deep link (affiliate tracking embedded by the API)
}

interface Dest { id: number; name: string; type: string; lat: number; lng: number }
const DESTS = destinations as Dest[];
// Specific, bookable place types — match a hotel to "things to do nearby" (not COUNTRY/STATE/REGION).
const NEAR_TYPES = new Set(["CITY", "TOWN", "NEIGHBORHOOD", "VILLAGE", "ISLAND", "NATIONAL_PARK", "AREA", "DISTRICT"]);
// Viator tags most products to the CITY/TOWN level; NEIGHBORHOOD/DISTRICT/AREA destinations have sparse
// catalogs (e.g. "French Quarter" = 1 product vs "New Orleans" = 40+). Prefer a catalog-rich city/town.
const PRIMARY_TYPES = new Set(["CITY", "TOWN", "ISLAND", "NATIONAL_PARK"]);
const NEAR = DESTS.filter((d) => NEAR_TYPES.has(d.type));

function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestDestination(lat: number, lng: number): Dest | null {
  let city: Dest | null = null, cityD = Infinity, any: Dest | null = null, anyD = Infinity;
  for (const d of NEAR) {
    const dist = km(lat, lng, d.lat, d.lng);
    if (dist < anyD) { anyD = dist; any = d; }
    if (PRIMARY_TYPES.has(d.type) && dist < cityD) { cityD = dist; city = d; }
  }
  if (city && cityD <= 80) return city; // prefer the catalog-rich city/town within ~80km
  return any && anyD <= 160 ? any : null; // else the nearest bookable place, within ~160km
}

const API = "https://api.viator.com/partner";
const cache = new Map<string, { value: Activity[]; exp: number }>();
const TTL = 60 * 60 * 1000; // 1h

interface RawImage { variants?: { width?: number; url?: string }[] }
interface RawProduct {
  productCode?: string; title?: string; images?: RawImage[]; productUrl?: string;
  reviews?: { combinedAverageRating?: number; totalReviews?: number };
  duration?: { fixedDurationInMinutes?: number };
  pricing?: { summary?: { fromPrice?: number }; currency?: string };
}

function pickImage(p: RawProduct): string {
  const variants = (p.images?.[0]?.variants ?? []).filter((v) => v.url).sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (variants.find((v) => (v.width ?? 0) >= 400) ?? variants[variants.length - 1])?.url ?? "";
}
function mapProduct(p: RawProduct): Activity {
  return {
    code: p.productCode ?? "",
    title: p.title ?? "",
    image: pickImage(p),
    rating: typeof p.reviews?.combinedAverageRating === "number" ? p.reviews.combinedAverageRating : null,
    reviews: typeof p.reviews?.totalReviews === "number" ? p.reviews.totalReviews : null,
    durationMin: typeof p.duration?.fixedDurationInMinutes === "number" ? p.duration.fixedDurationInMinutes : null,
    fromPrice: typeof p.pricing?.summary?.fromPrice === "number" ? p.pricing.summary.fromPrice : null,
    currency: p.pricing?.currency ?? "USD",
    url: p.productUrl ?? "",
  };
}

const POOL = 40; // fetch a generous pool per destination once, then quality-rank + slice/match per request

async function destinationPool(destId: number): Promise<Activity[]> {
  const key = `${destId}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) return [];
  try {
    const r = await fetch(`${API}/products/search`, {
      method: "POST",
      headers: { "exp-api-key": apiKey, Accept: "application/json;version=2.0", "Accept-Language": "en-US", "Content-Type": "application/json" },
      body: JSON.stringify({
        filtering: { destination: String(destId) },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1, count: POOL },
        currency: "USD",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return [];
    const j = (await r.json()) as { products?: RawProduct[] };
    const out = (j.products ?? []).map(mapProduct).filter((a) => a.title && a.url && a.image);
    cache.set(key, { value: out, exp: Date.now() + TTL });
    return out;
  } catch {
    return [];
  }
}

// QUALITY CONTROL (rack-and-stack): only tours rated >= 4.5; rank the >=100-review ones first (proven),
// then by rating, then by review count. A 4.5+ tour with < 100 reviews still qualifies (some great spots
// are just less-traveled) — it just ranks below the proven ones. Never show a sub-4.5 card.
function rankByQuality(list: Activity[]): Activity[] {
  return list
    .filter((a) => typeof a.rating === "number" && a.rating >= 4.5)
    .sort((a, b) => {
      const ap = (a.reviews ?? 0) >= 100 ? 1 : 0;
      const bp = (b.reviews ?? 0) >= 100 ? 1 : 0;
      if (ap !== bp) return bp - ap;
      if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
      return (b.reviews ?? 0) - (a.reviews ?? 0);
    });
}

/** Top-rated (>=4.5*) activities near a lat/lng, plus the matched place name (for the section title). */
export async function activitiesNear(lat?: number | null, lng?: number | null, limit = 8): Promise<{ activities: Activity[]; place: string | null }> {
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) return { activities: [], place: null };
  const dest = nearestDestination(lat, lng);
  if (!dest) return { activities: [], place: null };
  return { activities: rankByQuality(await destinationPool(dest.id)).slice(0, limit), place: dest.name };
}

/** Quality tours near a point whose TITLE matches a topic (e.g. "swamp", "jazz", "cemetery ghost"), for
 *  per-section blog offers. Matches any of the space-separated terms; returns the best `limit`, or []. */
export async function activitiesMatching(lat?: number | null, lng?: number | null, query = "", limit = 2): Promise<Activity[]> {
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) return [];
  const dest = nearestDestination(lat, lng);
  if (!dest) return [];
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return [];
  const pool = rankByQuality(await destinationPool(dest.id));
  return pool.filter((a) => { const t = a.title.toLowerCase(); return terms.some((term) => t.includes(term)); }).slice(0, limit);
}
