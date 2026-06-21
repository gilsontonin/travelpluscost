// Live RATES — the only thing fetched at request time (prices change). Server-only.
// In-memory cache (per server instance, ~10 min) so repeat loads are instant. Swap for Upstash
// Redis to share the cache across instances at scale (see docs/ARCHITECTURE.md).
import { getRates } from "./liteapi";
import { getOahuHotel } from "./oahu";
import type { Room } from "./oahu";

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
  freeCancelBefore?: string | null;
  sleeps?: number | null;
  beds?: { qty: number; type: string }[];
  sqft?: number | null;
  amenities?: string[];
  photos?: string[];
  resortFee?: { amount: number; currency: string; label: string } | null;
  price: Price;
}

interface Money {
  amount: number;
  currency: string;
}
interface TaxFee {
  included?: boolean;
  description?: string;
  amount?: number;
  currency?: string;
}
interface CancelPolicies {
  refundableTag?: string;
  cancelPolicyInfos?: { cancelTime?: string; amount?: number }[];
}
interface RateObj {
  name?: string;
  boardName?: string;
  boardType?: string;
  maxOccupancy?: number;
  cancellationPolicies?: CancelPolicies;
  retailRate?: { suggestedSellingPrice?: Money[]; total?: Money[]; taxesAndFees?: TaxFee[] };
}
interface RoomType {
  offerId?: string;
  rates?: RateObj[];
}

// ── Match a live rate's room name to ingested room CONTENT (photos/size/beds) ──
const STOP = new Set([
  "room", "rooms", "bed", "beds", "the", "with", "and", "for", "of", "a", "an",
  "non", "smoking", "accessible", "standard", "guest",
]);
function tokenize(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)),
  );
}
function matchRoom(name: string, rooms: Room[]): Room | undefined {
  const a = tokenize(name);
  if (!a.size || !rooms.length) return undefined;
  let best: Room | undefined;
  let bestScore = 0;
  for (const r of rooms) {
    const b = tokenize(r.name);
    if (!b.size) continue;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter++;
    const jaccard = inter / (a.size + b.size - inter);
    if (jaccard > bestScore) {
      bestScore = jaccard;
      best = r;
    }
  }
  return bestScore >= 0.25 ? best : undefined;
}
function resortFeeOf(rate: RateObj): RoomOffer["resortFee"] {
  const fees = rate.retailRate?.taxesAndFees ?? [];
  const fee = fees.find((f) => f && f.included === false && typeof f.amount === "number" && f.amount > 0);
  if (!fee) return null;
  return {
    amount: fee.amount as number,
    currency: fee.currency ?? "USD",
    label: fee.description ? `${fee.description} fee` : "Property fee",
  };
}
function freeCancelBefore(rate: RateObj): string | null {
  const cp = rate.cancellationPolicies;
  if (!cp || cp.refundableTag !== "RFN") return null;
  const infos = cp.cancelPolicyInfos ?? [];
  const first = infos.map((i) => i.cancelTime).filter(Boolean).sort()[0];
  return first ? first.slice(0, 10) : null;
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
  limit = 8,
): Promise<{ offers: RoomOffer[]; nights: number }> {
  const n = nightsBetween(ci, co);
  const key = `rooms|${id}|${ci}|${co}|${adults}`;
  const hit = readCache<{ offers: RoomOffer[]; nights: number }>(key);
  if (hit) return hit;

  const data = await fetchRates([id], ci, co, adults);
  const rh = data[0];
  const content = getOahuHotel(id);
  const rooms = content?.rooms ?? [];
  const hotelPhotos = content?.images ?? [];

  // One offer per room TYPE — keep the cheapest rate for each (Expedia groups this way),
  // not 200 near-identical rows.
  const byRoom = new Map<string, RoomOffer>();
  for (const rt of rh?.roomTypes ?? []) {
    for (const r of rt.rates ?? []) {
      const sp = r.retailRate?.suggestedSellingPrice?.[0];
      if (!rt.offerId || !sp || typeof sp.amount !== "number") continue;
      const roomName = r.name ?? "Room";
      const groupKey = roomName.toLowerCase().trim();
      const existing = byRoom.get(groupKey);
      if (existing && existing.price.amount <= sp.amount) continue;

      const cr = matchRoom(roomName, rooms);
      byRoom.set(groupKey, {
        offerId: rt.offerId,
        roomName,
        boardName: r.boardName,
        refundable: r.cancellationPolicies?.refundableTag === "RFN",
        freeCancelBefore: freeCancelBefore(r),
        sleeps: r.maxOccupancy ?? cr?.sleeps ?? null,
        beds: cr?.beds?.length ? cr.beds : undefined,
        sqft: cr?.sqft ?? null,
        amenities: cr?.amenities?.length ? cr.amenities.slice(0, 6) : undefined,
        photos: cr?.photos?.length ? cr.photos : hotelPhotos.slice(0, 3),
        resortFee: resortFeeOf(r),
        price: priced(sp, n),
      });
    }
  }
  const offers = [...byRoom.values()].sort((a, b) => a.price.amount - b.price.amount).slice(0, limit);
  const result = { offers, nights: n };
  writeCache(key, result);
  return result;
}
