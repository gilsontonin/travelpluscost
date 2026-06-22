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
export async function sandboxPrebook(input: PrebookInput): Promise<PrebookResult> {
  const base = await fetchOffers(input); // no margin: discover net + SSP
  if (!base.length) throw new Error("No availability for this hotel/date.");
  const want = canonRoom(input.room);
  base.sort((a, b) => Number(b.key === want) - Number(a.key === want) || a.ssp - b.ssp);

  let lastError = "No bookable rate for this room.";
  for (const cand of base.slice(0, 4)) {
    // Price THIS room with ITS OWN margin so the charge lands at its SSP (never below).
    const margin = marginToSSP(cand.net, cand.ssp);
    const priced = margin > 0 ? await fetchOffers(input, margin) : base;
    const offer = priced.find((o) => o.key === cand.key);
    if (!offer) continue; // no margined offer for this room → skip, never charge net publicly
    if (offer.net < cand.ssp - 0.5) continue; // compliance guard: must be >= SSP (allow 1c rounding)
    try {
      const pre = await call<{
        prebookId: string;
        secretKey?: string;
        transactionId?: string;
        price?: number;
        currency?: string;
      }>(`${BOOK}/rates/prebook`, { offerId: offer.offerId, usePaymentSdk: true });
      if (pre.prebookId && pre.secretKey && pre.transactionId && typeof pre.price === "number" && pre.price >= cand.ssp - 0.5) {
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
      lastError = "Prebook did not confirm a compliant price.";
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
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
