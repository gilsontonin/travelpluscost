// Live RATES — the only thing fetched at request time (prices change). Server-only.
// In-memory cache (per server instance, ~10 min) so repeat loads are instant. Swap for Upstash
// Redis to share the cache across instances at scale (see docs/ARCHITECTURE.md).
import { getRates } from "./liteapi";
import { getHotelContent } from "./hotelContent";
import type { Room } from "./oahu";

export interface Price {
  amount: number; // online portion (SSP) — room + taxes paid online
  currency: string;
  nights: number;
  perNight: number; // online per-night (amount / nights)
  refundable?: boolean;
  feesAtProperty?: number; // mandatory fees collected at check-in (stay total)
  allIn?: number; // amount + feesAtProperty — the true out-the-door price
}
export interface PropertyFee {
  label: string;
  amount: number;
  currency: string;
}
export interface RoomOffer {
  offerId: string;
  roomName: string;
  boardName?: string;
  refundable: boolean;
  freeCancelBefore?: string | null;
  view?: string | null;
  sleeps?: number | null;
  beds?: { qty: number; type: string }[];
  sqft?: number | null;
  amenities?: string[];
  features?: string[];
  photos?: string[];
  propertyFees?: PropertyFee[]; // ALL mandatory fees paid at the property (every included:false item)
  cancelChargeAfter?: { amount: number; currency: string } | null; // charged if cancelled after the free window
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
  cancelPolicyInfos?: { cancelTime?: string; amount?: number; currency?: string }[];
}
interface RateObj {
  name?: string;
  boardName?: string;
  boardType?: string;
  maxOccupancy?: number;
  mappedRoomId?: number; // roomMapping:true → resolves to a Room.ids entry (exact photos/beds/size)
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
// Preferred match: a rate's mappedRoomId (roomMapping:true) → the exact room content. Reliable,
// unlike the name heuristic below (which stays as the fallback for un-mapped hotels/rates).
function matchByMappedId(mappedRoomId: number | undefined, rooms: Room[]): Room | undefined {
  if (mappedRoomId == null) return undefined;
  return rooms.find((r) => r.ids?.includes(mappedRoomId));
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
// Collapse the dozens of supplier-named variants of the SAME physical room into one product
// — e.g. "2 Queen Beds - Oceanfront Room" / "Ocean Front Harbor - 2 Queens" / "OCEAN FRONT
// HARBOR 2 QUEEN BEDS" are one row, the way Expedia/Priceline group rate plans. LiteAPI returned
// 200 rate plans / 59 raw names for one hotel; this keys by bed config + view + tier + access,
// so we show ~15 real room types (cheapest plan each), not 8 near-dupes hiding the rest.
export function canonRoom(name: string): string {
  let s = name.toLowerCase().replace(/ocean\s*front|oceanfront/g, "oceanfront");
  s = s
    .replace(/\bqueens\b/g, "queen")
    .replace(/\bkings\b/g, "king")
    .replace(/\bdoubles\b/g, "double")
    .replace(/\bviews\b/g, "view");
  s = ` ${s.replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()} `;
  const has = (w: string) => s.includes(` ${w} `);
  const m = s.match(/ (\d+) (king|queen|double|twin)/);
  const bed = m
    ? `${m[1]}${m[2]}`
    : has("king") ? "1king"
    : has("queen") ? "1queen"
    : has("double") ? "double"
    : has("twin") ? "twin"
    : has("suite") ? "suite"
    : "room";
  const view = has("oceanfront")
    ? "oceanfront"
    : s.includes("ocean") && has("view") ? "oceanview"
    : s.includes("ocean") ? "oceanfront"
    : has("view") ? "view"
    : "";
  const tier = has("suite")
    ? "suite"
    : has("club") ? "club"
    : has("premier") ? "premier"
    : has("lanai") ? "lanai"
    : has("harbor") || has("harbour") ? "harbor"
    : has("standard") ? "standard"
    : "base";
  const acc = has("accessible") ? "acc" : "";
  return `${view}|${tier}|${bed}|${acc}`;
}

// Tidy a raw supplier room name for display (handles ALLCAPS + lowercase suppliers).
function tidyName(name: string): string {
  const small = new Set(["with", "and", "the", "of", "a"]);
  return name
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// EVERY mandatory fee collected at the property (included:false) — not just the first.
// The probe found two on one rate (Resort + Facility Fee); grabbing one undercounts the
// real out-the-door price, which is the misleading-pricing trap we exist to avoid.
// Collapse supplier fee variants into ONE line per real fee. Suppliers return the SAME fee multiple
// times with different spellings/amounts — verified on Outrigger Waikiki: one rate had 4 "resort"
// entries ("resort"/"Resort"/"Resort Fee"/"resort fee", $102–119). These must NOT be summed. We key
// by a normalized name (strip "fee", non-alphanumerics, case) and keep ONE line, taking the max as
// the disclosed estimate (the property charges the real amount at check-in). Genuinely distinct fees
// (e.g. "resort" vs "facility") keep separate lines. Also fixes the "Resort Fee fee" double-print.
export function dedupePropertyFees(
  fees: { included?: boolean; description?: string; amount?: number; currency?: string }[],
): PropertyFee[] {
  const normKey = (d: string) => d.toLowerCase().replace(/\bfees?\b/g, "").replace(/[^a-z0-9]+/g, "");
  const niceLabel = (d: string) => {
    const core = d.toLowerCase().replace(/\bfees?\b/g, " ").replace(/\s+/g, " ").trim();
    return core ? `${core.replace(/\b\w/g, (c) => c.toUpperCase())} fee` : "Property fee";
  };
  const byKey = new Map<string, PropertyFee>();
  for (const f of fees ?? []) {
    if (!f || f.included !== false || typeof f.amount !== "number" || f.amount <= 0) continue;
    const key = normKey(f.description ?? "") || "property";
    const cur = byKey.get(key);
    if (!cur) byKey.set(key, { label: niceLabel(f.description ?? ""), amount: f.amount, currency: f.currency ?? "USD" });
    else if (f.amount > cur.amount) cur.amount = f.amount; // same fee, different spelling → keep one (max)
  }
  return [...byKey.values()];
}
function propertyFeesOf(rate: RateObj): PropertyFee[] {
  return dedupePropertyFees(rate.retailRate?.taxesAndFees ?? []);
}
function propertyFeesTotal(rate: RateObj): number {
  return propertyFeesOf(rate).reduce((s, f) => s + f.amount, 0);
}
// "Free cancellation before X" = the earliest deadline where a charge actually begins.
// Per LiteAPI's cancellation guide each policy charges `amount` after its `cancelTime`, and a
// 0-amount policy is still free — so we skip 0/empty-amount policies and take the first NON-ZERO
// charge date. (RFN with no non-zero policy = fully refundable, no deadline → null → "Fully
// refundable".) Previously we took the earliest cancelTime regardless of amount, which understated
// the free window whenever a leading 0-amount policy was present.
function freeCancelBefore(rate: RateObj): string | null {
  const cp = rate.cancellationPolicies;
  if (!cp || cp.refundableTag !== "RFN") return null;
  const first = (cp.cancelPolicyInfos ?? [])
    .filter((i) => i.cancelTime && (i.amount ?? 0) > 0)
    .map((i) => i.cancelTime as string)
    .sort()[0];
  return first ? first.slice(0, 10) : null;
}
// The amount charged if a refundable room is cancelled AFTER its free window — the first non-zero
// policy (the one whose cancelTime is the free-cancel deadline). Lets the UI say "free until X,
// then $Y" the way LiteAPI's cancellation guide displays it. Null when fully refundable / non-refundable.
function cancelChargeAfter(rate: RateObj): { amount: number; currency: string } | null {
  const cp = rate.cancellationPolicies;
  if (!cp || cp.refundableTag !== "RFN") return null;
  const charged = (cp.cancelPolicyInfos ?? [])
    .filter((i) => i.cancelTime && (i.amount ?? 0) > 0)
    .sort((a, b) => (a.cancelTime as string).localeCompare(b.cancelTime as string))[0];
  return charged ? { amount: charged.amount as number, currency: charged.currency ?? "USD" } : null;
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
function priced(m: Money, n: number, feesAtProperty = 0): Price {
  const fees = Math.round(feesAtProperty * 100) / 100;
  return {
    amount: m.amount,
    currency: m.currency,
    nights: n,
    perNight: Math.max(1, Math.round(m.amount / n)),
    feesAtProperty: fees > 0 ? fees : undefined,
    allIn: Math.round((m.amount + fees) * 100) / 100,
  };
}

export function defaultDates(ci?: string | null, co?: string | null) {
  if (ci && co) return { checkin: ci, checkout: co };
  // No dates picked → show a near-term, relatable "from" price: 1 night, starting tomorrow.
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const a = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 1);
  const b = d.toISOString().slice(0, 10);
  return { checkin: a, checkout: b };
}

async function fetchRates(
  ids: string[],
  ci: string,
  co: string,
  adults: number,
  roomMapping = false,
  timeoutSec = 10,
): Promise<RatesHotel[]> {
  const res = (await getRates({
    hotelIds: ids,
    checkin: ci,
    checkout: co,
    occupancies: [{ adults }],
    currency: "USD",
    guestNationality: "US",
    // Bound latency: take whatever rates respond in time rather than hang on one slow hotel.
    // Result cards just need a "from" price (shorter); the room list wants completeness (longer).
    timeout: timeoutSec,
    // Only the property page (room list) needs per-rate room mapping; result cards don't.
    ...(roomMapping ? { roomMapping: true } : {}),
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
  const results = await Promise.all(chunks.map((c) => fetchRates(c, ci, co, adults, false, 10)));

  const out: Record<string, Price> = {};
  for (const data of results) {
    for (const rh of data) {
      let best: Money | undefined;
      let bestRate: RateObj | undefined;
      let bestRefundable = false;
      for (const rt of rh.roomTypes ?? []) {
        for (const r of rt.rates ?? []) {
          const sp = r.retailRate?.suggestedSellingPrice?.[0];
          if (sp && typeof sp.amount === "number" && (!best || sp.amount < best.amount)) {
            best = sp;
            bestRate = r;
            bestRefundable = r.cancellationPolicies?.refundableTag === "RFN";
          }
        }
      }
      if (best) {
        const fees = bestRate ? propertyFeesTotal(bestRate) : 0;
        out[rh.hotelId] = { ...priced(best, n, fees), refundable: bestRefundable };
      }
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
  limit = 40,
): Promise<{ offers: RoomOffer[]; nights: number }> {
  const n = nightsBetween(ci, co);
  const key = `rooms|${id}|${ci}|${co}|${adults}`;
  const hit = readCache<{ offers: RoomOffer[]; nights: number }>(key);
  if (hit) return hit;

  const data = await fetchRates([id], ci, co, adults, true); // roomMapping for exact room content
  const rh = data[0];
  const content = await getHotelContent(id); // curated JSON or live LiteAPI content (cached)
  const rooms = content?.rooms ?? [];
  const hotelPhotos = content?.images ?? [];

  // One offer per room TYPE — keep the cheapest rate for each (Expedia groups this way),
  // not 200 near-identical rows.
  const byRoom = new Map<string, RoomOffer>();
  for (const rt of rh?.roomTypes ?? []) {
    for (const r of rt.rates ?? []) {
      const sp = r.retailRate?.suggestedSellingPrice?.[0];
      if (!rt.offerId || !sp || typeof sp.amount !== "number") continue;
      const rawName = r.name ?? "Room";
      const groupKey = canonRoom(rawName);
      const existing = byRoom.get(groupKey);
      if (existing && existing.price.amount <= sp.amount) continue;

      // Exact room mapping first (mappedRoomId → room.ids), name heuristic as fallback.
      const cr = matchByMappedId(r.mappedRoomId, rooms) ?? matchRoom(rawName, rooms);
      const fees = propertyFeesOf(r);
      const feesTotal = fees.reduce((s, f) => s + f.amount, 0);
      byRoom.set(groupKey, {
        offerId: rt.offerId,
        roomName: tidyName(rawName),
        boardName: r.boardName,
        refundable: r.cancellationPolicies?.refundableTag === "RFN",
        freeCancelBefore: freeCancelBefore(r),
        cancelChargeAfter: cancelChargeAfter(r),
        view: cr?.view ?? null,
        sleeps: r.maxOccupancy ?? cr?.sleeps ?? null,
        beds: cr?.beds?.length ? cr.beds : undefined,
        sqft: cr?.sqft ?? null,
        amenities: cr?.amenities?.length ? cr.amenities.slice(0, 6) : undefined,
        features: cr?.features?.length ? cr.features : undefined,
        photos: cr?.photos?.length ? cr.photos : hotelPhotos.slice(0, 3),
        propertyFees: fees.length ? fees : undefined,
        price: priced(sp, n, feesTotal),
      });
    }
  }
  const offers = [...byRoom.values()].sort((a, b) => a.price.amount - b.price.amount).slice(0, limit);
  const result = { offers, nights: n };
  writeCache(key, result);
  return result;
}
