// SANDBOX booking flow — server-only. Runs the real LiteAPI chain (rates -> prebook -> book)
// against the SANDBOX key, with the production-correct Payment SDK path:
//   1) sandboxPrebook(): re-find a sandbox offer, prebook with usePaymentSdk:true → returns the
//      Stripe `secretKey` + `transactionId` (the client Payment SDK collects the card with these).
//   2) sandboxBookWithTransaction(): after the card is charged, book with method TRANSACTION_ID.
// This mirrors the official example app (github.com/liteapi-travel/build-website-example).
//
// NEVER point this at the production key — that takes real money, which is gated on LiteAPI MoR
// confirmation + Seller-of-Travel + refund/support process (see docs/PRICING.md §6, docs/LITEAPI.md).
//
// Why re-fetch rates here: a sandbox prebook needs a SANDBOX offerId, but the offerIds shown on the
// property page come from the PRODUCTION key and aren't valid in sandbox. Sandbox carries the same
// hotel data, so we look the room up again here.
import { canonRoom } from "./rates";

const API = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const BOOK = process.env.LITEAPI_BOOK_BASE_URL || "https://book.liteapi.travel/v3.0";

function sandboxKey(): string {
  const k = process.env.LITEAPI_SANDBOX;
  if (!k) throw new Error("LITEAPI_SANDBOX not set — sandbox booking is unavailable.");
  return k;
}

async function call<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": sandboxKey() },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { message?: string } };
  if (!res.ok) throw new Error(json?.error?.message || `LiteAPI ${res.status}`);
  return (json.data ?? (json as unknown)) as T;
}

interface SandboxRate {
  retailRate?: { suggestedSellingPrice?: { amount: number; currency: string }[] };
}
interface SandboxRoomType {
  offerId?: string;
  rates?: (SandboxRate & { name?: string; offerId?: string })[];
}

export interface PrebookInput {
  hotelId: string;
  room: string; // chosen room name (from the property page)
  checkin: string;
  checkout: string;
  adults: number;
}
export interface PrebookResult {
  prebookId: string;
  secretKey: string; // Stripe client secret — the Payment SDK uses this to collect the card
  transactionId: string; // passed to book() once the card is charged
  price: number; // binding price from prebook
  currency: string;
  room: string;
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

// Candidate offers for the chosen room: canonical matches first, then cheapest. Not every offer
// is prebookable (a rate can be gone, or a supplier flaky), so sandboxPrebook tries them in order.
async function findOffers(input: PrebookInput): Promise<{ offerId: string; room: string }[]> {
  const data = await call<{ hotelId: string; roomTypes?: SandboxRoomType[] }[]>(`${API}/hotels/rates`, {
    hotelIds: [input.hotelId],
    checkin: input.checkin,
    checkout: input.checkout,
    occupancies: [{ adults: input.adults }],
    currency: "USD",
    guestNationality: "US",
  });
  const want = canonRoom(input.room);
  const all: { offerId: string; room: string; price: number; matched: boolean }[] = [];
  const seen = new Set<string>();
  for (const rh of data ?? []) {
    for (const rt of rh.roomTypes ?? []) {
      for (const rate of rt.rates ?? []) {
        const offerId = rt.offerId ?? rate.offerId;
        const price = rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
        const name = rate.name ?? "Room";
        if (!offerId || typeof price !== "number" || seen.has(offerId)) continue;
        seen.add(offerId);
        all.push({ offerId, room: name, price, matched: canonRoom(name) === want });
      }
    }
  }
  if (!all.length) throw new Error("No availability for this hotel/date.");
  all.sort((a, b) => Number(b.matched) - Number(a.matched) || a.price - b.price);
  return all.map((o) => ({ offerId: o.offerId, room: o.room }));
}

// Step 1 — prebook with the Payment SDK enabled. Returns the keys the client widget needs.
// Walks candidate offers until one prebooks (sandbox 409s on some offers; rates also expire).
export async function sandboxPrebook(input: PrebookInput): Promise<PrebookResult> {
  const candidates = await findOffers(input);
  let lastError = "No bookable rate for this room.";
  for (const offer of candidates.slice(0, 6)) {
    try {
      const pre = await call<{
        prebookId: string;
        secretKey?: string;
        transactionId?: string;
        price?: number;
        currency?: string;
      }>(`${BOOK}/rates/prebook`, { offerId: offer.offerId, usePaymentSdk: true });
      if (pre.prebookId && pre.secretKey && pre.transactionId) {
        return {
          prebookId: pre.prebookId,
          secretKey: pre.secretKey,
          transactionId: pre.transactionId,
          price: pre.price ?? 0,
          currency: pre.currency ?? "USD",
          room: offer.room,
        };
      }
      lastError = "Prebook did not return Payment SDK credentials.";
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
