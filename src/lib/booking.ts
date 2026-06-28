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
  boardName?: string;
  cancellationPolicies?: { refundableTag?: string };
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
  member?: boolean; // logged-in → charge the member price (below SSP); set by the /api/prebook route
  // The identity of the rate the guest actually saw + accepted on the card — so prebook re-prices the
  // SAME room (never substitutes a cheaper one) and charges the price they agreed to ("one true price").
  board?: string;       // displayed board name (e.g. "Room Only")
  refundable?: boolean; // displayed cancellation terms — keeps the "free cancellation" promise honest
  agreedPrice?: number; // the online price the guest saw + accepted — we charge THIS, capped to never go below cost
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
  priceChanged?: boolean; // true if the room's live cost rose above the agreed price (we charge the new, higher price)
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
  board: string;
  refundable: boolean;
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
  // `call()` returns json.data when present, else the whole response — so a rates error/empty reply
  // hands back a non-array object, and `?? []` (which only guards null/undefined) wouldn't catch it.
  // Guard with Array.isArray so a bad reply yields no offers (→ honest "No availability") not a crash.
  const hotels = Array.isArray(data) ? (data as { roomTypes?: RoomTypeLite[] }[]) : [];
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
          board: rate.boardName ?? "",
          refundable: rate.cancellationPolicies?.refundableTag === "RFN",
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

// Member markup % over net (cost + our flat fee). Keep in sync with MEMBER_MARKUP=1.15 in rates.ts — the
// member CHARGE must equal the member price shown on the cards/rooms/book page. INTERNAL — never display.
const MEMBER_MARGIN_PCT = 15;

// The member CHARGE: cost + our flat fee, capped at SSP (a member never pays above the public price).
const memberCharge = (net: number, ssp: number) => Math.min(Math.round(net * (1 + MEMBER_MARGIN_PCT / 100)), Math.round(ssp));

// Step 1 — re-price the EXACT room the guest selected and prebook it with the Payment SDK enabled.
// We match the SAME room (and, where available, the same board + cancellation terms) the card showed, then
// price it to the amount the guest accepted — the "one true price" (PRICING.md §4c). We NEVER substitute a
// cheaper room, NEVER charge below our cost, and (public site only) NEVER below SSP. If the room's cost has
// risen above the agreed price we fall back to the honest live price; if it's gone we report it sold out.
const MAX_PREBOOK_ATTEMPTS = 6;
export async function sandboxPrebook(input: PrebookInput): Promise<PrebookResult> {
  const base = await fetchOffers(input); // discover net + SSP + board + cancellation per offer
  if (!base.length) throw new Error("No availability for this hotel/date.");
  const want = canonRoom(input.room);

  // Only the SAME room the guest picked — we never swap in a different (cheaper) room.
  const sameRoom = base.filter((o) => o.key === want);
  if (!sameRoom.length) throw new Error("This room just sold out — please choose another room.");

  // Prefer the same cancellation terms (keeps the "free cancellation" promise honest), then the same board,
  // then the cheapest cost (so any upside stays our margin). We charge the agreed price either way.
  const matchScore = (o: Offer) =>
    (input.refundable == null || o.refundable === input.refundable ? 2 : 0) + (!input.board || o.board === input.board ? 1 : 0);
  // Members rank by cheapest COST (we charge the agreed price, so the cheapest rate maximises our margin);
  // the public ranks by cheapest SSP — the exact rate the rooms page displayed — so the SSP we charge matches.
  sameRoom.sort((a, b) => matchScore(b) - matchScore(a) || (input.member ? a.net - b.net : a.ssp - b.ssp));

  let lastError = "No bookable rate for this room.";
  for (const cand of sameRoom.slice(0, MAX_PREBOOK_ATTEMPTS)) {
    // Charge = the price the guest agreed to. Guardrails: never below our cost; public never below SSP. If the
    // cost has RISEN above the agreed price, charge the honest live price (member markup, else SSP) instead.
    let target = input.agreedPrice && input.agreedPrice > 0 ? input.agreedPrice : input.member ? memberCharge(cand.net, cand.ssp) : Math.round(cand.ssp);
    if (target < cand.net) target = input.member ? memberCharge(cand.net, cand.ssp) : Math.round(cand.ssp); // cost rose past agreed
    if (!input.member && target < cand.ssp) target = Math.round(cand.ssp); // public floor = SSP
    // Margin (floored, so the charge never lands ABOVE what they agreed) that lifts our cost up to the target.
    const margin = cand.net > 0 ? Math.max(0, Math.floor((target / cand.net - 1) * 10000) / 100) : 0;

    // Re-fetch at that margin to get the binding (margin-priced) offerId for THIS same rate.
    let priced: Offer = cand;
    if (margin > 0) {
      let list: Offer[];
      try {
        list = await fetchOffers(input, margin);
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        continue;
      }
      priced =
        list.find((p) => p.key === cand.key && p.board === cand.board && p.refundable === cand.refundable) ??
        list.find((p) => p.key === cand.key) ??
        cand;
    }
    try {
      const pre = await call<{
        prebookId: string;
        secretKey?: string;
        transactionId?: string;
        price?: number;
        currency?: string;
      }>(`${BOOK}/rates/prebook`, { offerId: priced.offerId, usePaymentSdk: true });
      if (pre.prebookId && pre.secretKey && pre.transactionId && typeof pre.price === "number") {
        if (pre.price < cand.net - 0.5) {
          lastError = "Confirmed price below cost.";
          continue; // never charge below our wholesale cost
        }
        if (!input.member && pre.price < cand.ssp - 0.5) {
          lastError = "Confirmed price was below SSP.";
          continue; // public site: never below SSP (members may — closed user group)
        }
        const feeSum = Math.round(cand.fees.reduce((s, f) => s + f.amount, 0) * 100) / 100;
        return {
          prebookId: pre.prebookId,
          secretKey: pre.secretKey,
          transactionId: pre.transactionId,
          price: pre.price,
          currency: pre.currency ?? "USD",
          room: cand.room,
          feesAtProperty: feeSum,
          propertyFees: cand.fees,
          priceChanged: !!(input.agreedPrice && input.agreedPrice > 0 && pre.price > input.agreedPrice + 0.5),
        };
      }
      lastError = "Prebook did not return Payment SDK credentials.";
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e); // 409 → try the next rate of this SAME room
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
    // Idempotency key: the booking-complete return URL can fire twice (reload/back), and the card
    // is already charged by then — a stable reference per paid transaction lets LiteAPI dedupe
    // instead of creating a second reservation on the same charge.
    clientReference: input.transactionId,
  });
  return {
    bookingId: booked.bookingId ?? "—",
    confirmationCode: booked.hotelConfirmationCode ?? booked.bookingId ?? "—",
    status: booked.status ?? "UNKNOWN",
  };
}
