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
const NEAR = DESTS.filter((d) => NEAR_TYPES.has(d.type));

function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestDestination(lat: number, lng: number): Dest | null {
  let best: Dest | null = null, bestD = Infinity;
  for (const d of NEAR) {
    const dist = km(lat, lng, d.lat, d.lng);
    if (dist < bestD) { bestD = dist; best = d; }
  }
  return best && bestD <= 160 ? best : null; // within ~160km, else no "nearby" activities
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

async function searchDestination(destId: number, limit: number): Promise<Activity[]> {
  const key = `${destId}|${limit}`;
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
        pagination: { start: 1, count: limit },
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

/** Top-rated activities near a lat/lng, plus the matched place name (for the section title). */
export async function activitiesNear(lat?: number | null, lng?: number | null, limit = 8): Promise<{ activities: Activity[]; place: string | null }> {
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) return { activities: [], place: null };
  const dest = nearestDestination(lat, lng);
  if (!dest) return { activities: [], place: null };
  return { activities: await searchDestination(dest.id, limit), place: dest.name };
}
