// Live RATES — the only thing fetched at request time (prices change). Server-only.
// In-memory cache (per server instance, ~10 min) so repeat loads are instant. Swap for Upstash
// Redis to share the cache across instances at scale (see docs/ARCHITECTURE.md).
import { getRates } from "./liteapi";

export interface Price {
  amount: number;
  currency: string;
  nights: number;
  perNight: number;
}
export interface RoomOffer {
  offerId: string;
  roomName: string;
  boardName?: string;
  refundable: boolean;
  price: Price;
}

interface Money {
  amount: number;
  currency: string;
}
interface RateObj {
  name?: string;
  boardName?: string;
  cancellationPolicies?: unknown;
  retailRate?: { suggestedSellingPrice?: Money[]; total?: Money[] };
}
interface RoomType {
  offerId?: string;
  rates?: RateObj[];
}
interface RatesHotel {
  hotelId: string;
  roomTypes?: RoomType[];
}

const cache = new Map<string, { value: unknown; exp: number }>();
const TTL = 10 * 60 * 1000;
function readCache<T>(key: string): T | undefined {
  const e = cache.get(key);
  if (e && e.exp > Date.now()) return e.value as T;
  return undefined;
}
function writeCache(key: string, value: unknown) {
  cache.set(key, { value, exp: Date.now() + TTL });
}

function nightsBetween(ci: string, co: string) {
  const n = Math.round((Date.parse(co) - Date.parse(ci)) / 86_400_000);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
function priced(m: Money, n: number): Price {
  return { amount: m.amount, currency: m.currency, nights: n, perNight: Math.max(1, Math.round(m.amount / n)) };
}

export function defaultDates(ci?: string | null, co?: string | null) {
  if (ci && co) return { checkin: ci, checkout: co };
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const a = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 2);
  const b = d.toISOString().slice(0, 10);
  return { checkin: a, checkout: b };
}

async function fetchRates(ids: string[], ci: string, co: string, adults: number): Promise<RatesHotel[]> {
  const res = (await getRates({
    hotelIds: ids,
    checkin: ci,
    checkout: co,
    occupancies: [{ adults }],
    currency: "USD",
    guestNationality: "US",
  })) as { data?: RatesHotel[] };
  return res?.data ?? [];
}

/** Cheapest SSP price per hotel (for result cards). */
export async function getPrices(
  ids: string[],
  ci: string,
  co: string,
  adults: number,
): Promise<Record<string, Price>> {
  if (!ids.length) return {};
  const n = nightsBetween(ci, co);
  const key = `prices|${ci}|${co}|${adults}|${[...ids].sort().join(",")}`;
  const hit = readCache<Record<string, Price>>(key);
  if (hit) return hit;

  // LiteAPI caps hotels per rates call, so chunk + fetch in parallel + merge.
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20));
  const results = await Promise.all(chunks.map((c) => fetchRates(c, ci, co, adults)));

  const out: Record<string, Price> = {};
  for (const data of results) {
    for (const rh of data) {
      let best: Money | undefined;
      for (const rt of rh.roomTypes ?? []) {
        for (const r of rt.rates ?? []) {
          const sp = r.retailRate?.suggestedSellingPrice?.[0];
          if (sp && typeof sp.amount === "number" && (!best || sp.amount < best.amount)) best = sp;
        }
      }
      if (best) out[rh.hotelId] = priced(best, n);
    }
  }
  writeCache(key, out);
  return out;
}

/** Room offers for one hotel (for the property page). */
export async function getRooms(
  id: string,
  ci: string,
  co: string,
  adults: number,
  limit = 6,
): Promise<{ offers: RoomOffer[]; nights: number }> {
  const n = nightsBetween(ci, co);
  const key = `rooms|${id}|${ci}|${co}|${adults}`;
  const hit = readCache<{ offers: RoomOffer[]; nights: number }>(key);
  if (hit) return hit;

  const data = await fetchRates([id], ci, co, adults);
  const rh = data[0];
  let offers: RoomOffer[] = [];
  for (const rt of rh?.roomTypes ?? []) {
    const r = rt.rates?.[0];
    const sp = r?.retailRate?.suggestedSellingPrice?.[0];
    if (rt.offerId && r && sp) {
      offers.push({
        offerId: rt.offerId,
        roomName: r.name ?? "Room",
        boardName: r.boardName,
        refundable: Array.isArray(r.cancellationPolicies) && (r.cancellationPolicies as unknown[]).length > 0,
        price: priced(sp, n),
      });
    }
  }
  offers = offers.sort((a, b) => a.price.amount - b.price.amount).slice(0, limit);
  const result = { offers, nights: n };
  writeCache(key, result);
  return result;
}
