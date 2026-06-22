// SANDBOX booking flow — server-only. Production-correct Payment SDK path against the SANDBOX key.
//
//   1) sandboxPrebook(): find a sandbox offer, PRICE IT with a per-rate margin so the amount charged
//      equals what we display (LiteAPI's payment charges retailRate.total = NET at margin 0, i.e. the
//      raw wholesale — verified; the margin lifts it to ~SSP). prebook with usePaymentSdk:true →
//      returns the Stripe secretKey + transactionId + the binding price + at-property fees.
//   2) sandboxBookWithTransaction(): after the card is charged, book with method TRANSACTION_ID.
//
// NEVER point this at the production key — that takes real money, gated on LiteAPI MoR confirmation +
// Seller-of-Travel + a refund/support process (docs/PRICING.md §6, docs/LITEAPI.md).
import { canonRoom, dedupePropertyFees } from "./rates";

const API = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const BOOK = process.env.LITEAPI_BOOK_BASE_URL || "https://book.liteapi.travel/v3.0";

// LIVE mode (NEXT_PUBLIC_PAYMENT_ENV=live) uses the PRODUCTION key → real Stripe PaymentIntents
// (real money). Anything else uses the sandbox key. The deployed site reads Netlify's env (not
// "live"), so production stays sandbox; only a local .env.local set to "live" flips this machine.
function apiKey(): string {
  const live = process.env.NEXT_PUBLIC_PAYMENT_ENV === "live";
  const k = live ? process.env.LITEAPI_KEY : process.env.LITEAPI_SANDBOX;
  if (!k) throw new Error(`${live ? "LITEAPI_KEY" : "LITEAPI_SANDBOX"} not set.`);
  return k;
}

async function call<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey() },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { message?: string } };
  if (!res.ok) throw new Error(json?.error?.message || `LiteAPI ${res.status}`);
  return (json.data ?? (json as unknown)) as T;
}

interface TaxFee {
  included?: boolean;
  description?: string;
  amount?: number;
  currency?: string;
}
interface RateLite {
  name?: string;
  retailRate?: {
    total?: { amount: number }[];
    suggestedSellingPrice?: { amount: number }[];
    taxesAndFees?: TaxFee[];
  };
}
interface RoomTypeLite {
  offerId?: string;
  rates?: (RateLite & { offerId?: string })[];
}

export interface PropertyFeeLite {
  label: string;
  amount: number;
  currency: string;
}
export interface PrebookInput {
  hotelId: string;
  room: string;
  checkin: string;
  checkout: string;
  adults: number;
}
export interface PrebookResult {
  prebookId: string;
  secretKey: string;
  transactionId: string;
  price: number; // the amount the Stripe widget charges NOW (room + online taxes, margin applied)
  currency: string;
  room: string;
  feesAtProperty: number; // sum of mandatory fees paid AT the hotel — NOT in `price`
  propertyFees: PropertyFeeLite[];
}
export interface BookInput {
  prebookId: string;
  transactionId: string;
  firstName: string;
  lastName: string;
  email: string;
}
export interface BookingResult {
  bookingId: string;
  confirmationCode: string;
  status: string;
}

// ── Manage / cancel (GET + PUT /bookings/{id}, book host) — field names verified against a live
// sandbox round-trip (book → retrieve → cancel). The same key the booking was made with must be
// used, which apiKey() already handles (live→prod, else sandbox). ──
export interface BookingDetails {
  bookingId: string;
  status: string; // CONFIRMED | CANCELLED | CANCELLED_WITH_CHARGES | …
  confirmationCode: string;
  holderEmail: string; // lowercased — used to verify the requester owns the booking
  holderName: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  roomName: string;
  boardName?: string;
  price: number;
  currency: string;
  refundable: boolean;
  freeCancelBefore: string | null;
  cancelChargeAfter: { amount: number; currency: string } | null;
  cancelled: boolean;
}
export interface CancelResult {
  status: string;
  cancellationFee: number;
  refundAmount: number;
  currency: string;
}

interface RawCancelInfo {
  refundableTag?: string;
  cancelPolicyInfos?: { cancelTime?: string; amount?: number; currency?: string }[];
}
interface RawBooking {
  bookingId?: string;
  status?: string;
  hotelConfirmationCode?: string;
  holder?: { firstName?: string; lastName?: string; email?: string };
  email?: string;
  firstName?: string;
  lastName?: string;
  hotel?: { name?: string };
  hotelName?: string;
  checkin?: string;
  checkout?: string;
  bookedRooms?: { roomType?: { name?: string }; boardName?: string }[];
  price?: number;
  sellingPriceToUser?: number;
  currency?: string;
  cancellationPolicies?: RawCancelInfo;
}

async function callMethod<T>(url: string, method: "GET" | "PUT"): Promise<T> {
  const res = await fetch(url, { method, headers: { "X-API-Key": apiKey() } });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { message?: string } };
  if (!res.ok) throw new Error(json?.error?.message || `LiteAPI ${res.status}`);
  return (json.data ?? (json as unknown)) as T;
}

// Free-cancel date / post-window charge from a booking's policies — same 0-amount-discard rule as
// rates.ts (LiteAPI's recommended impl): a 0-amount node is still free, so skip it.
function policyDates(cp: RawCancelInfo | undefined) {
  if (!cp || cp.refundableTag !== "RFN") return { freeCancelBefore: null, cancelChargeAfter: null };
  const charged = (cp.cancelPolicyInfos ?? [])
    .filter((i) => i.cancelTime && (i.amount ?? 0) > 0)
    .sort((a, b) => (a.cancelTime as string).localeCompare(b.cancelTime as string))[0];
  return {
    freeCancelBefore: charged ? (charged.cancelTime as string).slice(0, 10) : null,
    cancelChargeAfter: charged ? { amount: charged.amount as number, currency: charged.currency ?? "USD" } : null,
  };
}

const isCancelled = (status: string) => /CANCEL/i.test(status);

export async function retrieveBooking(bookingId: string): Promise<BookingDetails> {
  const d = await callMethod<RawBooking>(`${BOOK}/bookings/${encodeURIComponent(bookingId)}`, "GET");
  const cp = d.cancellationPolicies;
  const room = d.bookedRooms?.[0] ?? {};
  const status = d.status ?? "UNKNOWN";
  return {
    bookingId: d.bookingId ?? bookingId,
    status,
    confirmationCode: d.hotelConfirmationCode ?? d.bookingId ?? bookingId,
    holderEmail: (d.holder?.email ?? d.email ?? "").trim().toLowerCase(),
    holderName: [d.holder?.firstName ?? d.firstName, d.holder?.lastName ?? d.lastName].filter(Boolean).join(" "),
    hotelName: d.hotel?.name ?? d.hotelName ?? "your hotel",
    checkin: d.checkin ?? "",
    checkout: d.checkout ?? "",
    roomName: room.roomType?.name ?? "Room",
    boardName: room.boardName,
    price: d.price ?? d.sellingPriceToUser ?? 0,
    currency: d.currency ?? "USD",
    refundable: cp?.refundableTag === "RFN",
    ...policyDates(cp),
    cancelled: isCancelled(status),
  };
}

export async function cancelBooking(bookingId: string): Promise<CancelResult> {
  const d = await callMethod<{
    status?: string;
    cancellation_fee?: number;
    refund_amount?: number;
    currency?: string;
  }>(`${BOOK}/bookings/${encodeURIComponent(bookingId)}`, "PUT");
  return {
    status: d.status ?? "CANCELLED",
    cancellationFee: d.cancellation_fee ?? 0,
    refundAmount: d.refund_amount ?? 0,
    currency: d.currency ?? "USD",
  };
}

interface Offer {
  offerId: string;
  room: string;
  net: number; // retailRate.total — what the widget would charge for this offer
  ssp: number;
  fees: PropertyFeeLite[];
  key: string;
}

// Same normalizer the property page uses — collapses "resort"/"Resort"/"Resort Fee" variants to one.
function feesFrom(rate: RateLite): PropertyFeeLite[] {
  return dedupePropertyFees(rate.retailRate?.taxesAndFees ?? []);
}

async function fetchOffers(input: PrebookInput, margin?: number): Promise<Offer[]> {
  const body: Record<string, unknown> = {
    hotelIds: [input.hotelId],
    checkin: input.checkin,
    checkout: input.checkout,
    occupancies: [{ adults: input.adults }],
    currency: "USD",
    guestNationality: "US",
  };
  if (margin && margin > 0) body.margin = margin; // margin lifts retailRate.total toward SSP
  const data = await call<RoomTypeLite[] | { roomTypes?: RoomTypeLite[] }[]>(`${API}/hotels/rates`, body);
  const hotels = (data as { roomTypes?: RoomTypeLite[] }[]) ?? [];
  const out: Offer[] = [];
  const seen = new Set<string>();
  for (const rh of hotels) {
    for (const rt of rh.roomTypes ?? []) {
      for (const rate of rt.rates ?? []) {
        const offerId = rt.offerId ?? rate.offerId;
        const net = rate.retailRate?.total?.[0]?.amount;
        const ssp = rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
        const name = rate.name ?? "Room";
        if (!offerId || typeof net !== "number" || seen.has(offerId)) continue;
        seen.add(offerId);
        out.push({
          offerId,
          room: name,
          net,
          ssp: typeof ssp === "number" ? ssp : net,
          fees: feesFrom(rate),
          key: canonRoom(name),
        });
      }
    }
  }
  return out;
}

// Smallest 2-decimal margin% that lifts net to >= SSP (decimals are supported per LiteAPI docs).
// LiteAPI rule: never sell BELOW the suggested selling price on a public site — so we price at SSP,
// not at raw wholesale. (Below-SSP "cost + small fee" is reserved for the future logged-in member
// tier — a permitted "closed user group".)
function marginToSSP(net: number, ssp: number): number {
  if (!(net > 0) || !(ssp > net)) return 0;
  return Math.ceil((ssp / net - 1) * 10000) / 100;
}

// Step 1 — price the chosen room AT its SSP, prebook with the Payment SDK enabled.
// Production has real availability: many offers 409 ("no availability"). So we walk MANY priced
// offers (matched room first, then cheapest), trying each until one prebooks — never charging
// below the room's SSP.
const MAX_PREBOOK_ATTEMPTS = 10;
export async function sandboxPrebook(input: PrebookInput): Promise<PrebookResult> {
  const base = await fetchOffers(input); // no margin: discover net + SSP
  if (!base.length) throw new Error("No availability for this hotel/date.");
  const want = canonRoom(input.room);

  // SSP floor per room (the price we must never sell below on a public site).
  const sspByKey = new Map<string, number>();
  for (const o of base) {
    const cur = sspByKey.get(o.key);
    if (cur == null || o.ssp < cur) sspByKey.set(o.key, o.ssp);
  }

  // One margin tuned to the chosen (matched, else cheapest) room, so its charge lands at SSP.
  base.sort((a, b) => Number(b.key === want) - Number(a.key === want) || a.ssp - b.ssp);
  const margin = marginToSSP(base[0].net, base[0].ssp);
  const priced = margin > 0 ? await fetchOffers(input, margin) : base;
  // Try the matched room first, then by ascending charge.
  priced.sort((a, b) => Number(b.key === want) - Number(a.key === want) || a.net - b.net);

  let lastError = "No bookable rate for this room.";
  let attempts = 0;
  for (const offer of priced) {
    const floor = sspByKey.get(offer.key);
    if (floor != null && offer.net < floor - 0.5) continue; // never sell below SSP
    if (attempts >= MAX_PREBOOK_ATTEMPTS) break;
    attempts++;
    try {
      const pre = await call<{
        prebookId: string;
        secretKey?: string;
        transactionId?: string;
        price?: number;
        currency?: string;
      }>(`${BOOK}/rates/prebook`, { offerId: offer.offerId, usePaymentSdk: true });
      if (pre.prebookId && pre.secretKey && pre.transactionId && typeof pre.price === "number") {
        if (floor != null && pre.price < floor - 0.5) {
          lastError = "Confirmed price was below SSP.";
          continue; // compliance: never charge below SSP
        }
        const feeSum = Math.round(offer.fees.reduce((s, f) => s + f.amount, 0) * 100) / 100;
        return {
          prebookId: pre.prebookId,
          secretKey: pre.secretKey,
          transactionId: pre.transactionId,
          price: pre.price,
          currency: pre.currency ?? "USD",
          room: offer.room,
          feesAtProperty: feeSum,
          propertyFees: offer.fees,
        };
      }
      lastError = "Prebook did not return Payment SDK credentials.";
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e); // e.g. 409 "no availability" → try next
    }
  }
  throw new Error(lastError);
}

// Step 2 — after the card is charged by the Payment SDK, finalise the reservation.
export async function sandboxBookWithTransaction(input: BookInput): Promise<BookingResult> {
  const booked = await call<{
    bookingId?: string;
    hotelConfirmationCode?: string;
    status?: string;
  }>(`${BOOK}/rates/book`, {
    prebookId: input.prebookId,
    holder: { firstName: input.firstName, lastName: input.lastName, email: input.email },
    guests: [
      { occupancyNumber: 1, firstName: input.firstName, lastName: input.lastName, email: input.email },
    ],
    payment: { method: "TRANSACTION_ID", transactionId: input.transactionId },
  });
  return {
    bookingId: booked.bookingId ?? "—",
    confirmationCode: booked.hotelConfirmationCode ?? booked.bookingId ?? "—",
    status: booked.status ?? "UNKNOWN",
  };
}
