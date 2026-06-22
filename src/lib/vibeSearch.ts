// "Search by vibe" — natural-language hotel search via LiteAPI's aiSearch. A free-text query
// ("romantic beachfront resort with ocean views") returns matched hotels with rich editorial
// metadata (persona / style / story / tags) + live rates in one call. Server-only, and a PAID call
// per search (unlike our free directory autocomplete) — so it's submit-driven and short-cached.
import { getRates } from "./liteapi";

export interface VibeHotel {
  id: string;
  name: string;
  image: string;
  city: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  stars: number | null;
  tags: string[];
  persona: string | null;
  style: string | null;
  locationType: string | null;
  story: string;
  lat: number | null;
  lng: number | null;
  perNight: number | null; // cheapest SSP / night (null = no availability for these dates)
  currency: string;
  nights: number;
}

interface RawAiHotel {
  id?: string; name?: string; main_photo?: string; thumbnail?: string; address?: string;
  city_name?: string; rating?: number; stars?: number; review_count?: number; tags?: string[];
  persona?: string; style?: string; location_type?: string; story?: string;
  latitude?: number; longitude?: number;
}
interface RawRate { retailRate?: { suggestedSellingPrice?: { amount?: number; currency?: string }[] } }
interface RawData { hotelId?: string; roomTypes?: { rates?: RawRate[] }[] }

function nightsBetween(ci: string, co: string) {
  const n = Math.round((Date.parse(co) - Date.parse(ci)) / 86_400_000);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

const cache = new Map<string, { value: VibeHotel[]; exp: number }>();
const TTL = 10 * 60 * 1000; // short cache so back-navigation / repeat queries don't re-charge the AI call

export async function vibeSearch(query: string, checkin: string, checkout: string, adults: number): Promise<VibeHotel[]> {
  const q = query.trim();
  if (!q) return [];
  const key = `${q.toLowerCase()}|${checkin}|${checkout}|${adults}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;

  const n = nightsBetween(checkin, checkout);
  const res = (await getRates({
    aiSearch: q,
    includeHotelData: true,
    checkin,
    checkout,
    occupancies: [{ adults }],
    currency: "USD",
    guestNationality: "US",
    timeout: 12,
  })) as { hotels?: RawAiHotel[]; data?: RawData[] };

  // cheapest SSP per hotel from the rate data
  const cheapest = new Map<string, { amount: number; currency: string }>();
  for (const rh of res?.data ?? []) {
    if (!rh.hotelId) continue;
    let best: { amount: number; currency: string } | undefined;
    for (const rt of rh.roomTypes ?? []) {
      for (const r of rt.rates ?? []) {
        const sp = r.retailRate?.suggestedSellingPrice?.[0];
        if (sp && typeof sp.amount === "number" && (!best || sp.amount < best.amount)) {
          best = { amount: sp.amount, currency: sp.currency ?? "USD" };
        }
      }
    }
    if (best) cheapest.set(rh.hotelId, best);
  }

  const out: VibeHotel[] = [];
  for (const h of res?.hotels ?? []) {
    if (!h.id || !h.name) continue;
    const price = cheapest.get(h.id);
    out.push({
      id: h.id,
      name: h.name,
      image: h.main_photo || h.thumbnail || "",
      city: h.city_name ?? "",
      address: h.address ?? "",
      rating: typeof h.rating === "number" ? h.rating : null,
      reviewCount: typeof h.review_count === "number" ? h.review_count : null,
      stars: typeof h.stars === "number" ? h.stars : null,
      tags: Array.isArray(h.tags) ? h.tags.slice(0, 12) : [],
      persona: h.persona ?? null,
      style: h.style ?? null,
      locationType: h.location_type ?? null,
      story: h.story ?? "",
      lat: typeof h.latitude === "number" ? h.latitude : null,
      lng: typeof h.longitude === "number" ? h.longitude : null,
      perNight: price ? Math.max(1, Math.round(price.amount / n)) : null,
      currency: price?.currency ?? "USD",
      nights: n,
    });
  }
  cache.set(key, { value: out, exp: Date.now() + TTL });
  return out;
}
