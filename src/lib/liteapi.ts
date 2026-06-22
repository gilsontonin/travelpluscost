// LiteAPI client — hotel content + live rates (and, in the merchant phase, booking).
// Auth: X-API-Key header. Endpoint paths follow LiteAPI v3.0 (verified against
// https://docs.liteapi.travel, 2026-06-21 — see docs/LITEAPI.md).
//
// IMPORTANT — two hosts: search + static content live on api.liteapi.travel; the booking
// flow (prebook/book/manage) lives on book.liteapi.travel. Pass { base: "book" } for those.
import { serverEnv, requireEnv } from "./env";

type Query = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, query?: Query, base: "api" | "book" = "api"): string {
  const root = base === "book" ? serverEnv.LITEAPI_BOOK_BASE_URL : serverEnv.LITEAPI_BASE_URL;
  const url = new URL(`${root}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function liteApiFetch<T>(
  path: string,
  init: RequestInit & { query?: Query; base?: "api" | "book" } = {},
): Promise<T> {
  const { query, base, ...rest } = init;
  const res = await fetch(buildUrl(path, query, base), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": requireEnv("LITEAPI_KEY"),
      ...(rest.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LiteAPI ${path} failed: ${res.status} ${res.statusText} ${body}`.trim());
  }
  return (await res.json()) as T;
}

/** Static hotel content for a location (paginated). Used by the ingest pipeline. */
export function getHotels(
  params: { countryCode?: string; cityName?: string; limit?: number; offset?: number } = {},
) {
  return liteApiFetch<unknown>("/data/hotels", { method: "GET", query: params });
}

/** Full content for a single hotel. timeoutMs caps the wait so a slow LiteAPI can't block the
 *  property-page render — getHotelContent falls back to the thin directory row on timeout. */
export function getHotelDetails(hotelId: string, timeoutMs = 5000) {
  return liteApiFetch<unknown>("/data/hotel", {
    method: "GET",
    query: { hotelId },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

/** Live rates for a set of hotels on given dates/occupancy. */
export function getRates(body: {
  hotelIds: string[];
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  occupancies: { adults: number; children?: number[] }[];
  currency?: string;
  guestNationality?: string;
  roomMapping?: boolean; // true → each rate carries a mappedRoomId for exact room content
  timeout?: number; // seconds; LiteAPI returns whatever responded in time (recommended 4–10 for live)
}) {
  return liteApiFetch<unknown>("/hotels/rates", { method: "POST", body: JSON.stringify(body) });
}

// ── Merchant phase (PARKED — live only behind NEXT_PUBLIC_BOOKING_MODE=merchant) ──
// Verified shapes from docs.liteapi.travel (2026-06-21). All three are on the BOOK host
// (base: "book"). The authoritative price the guest owes comes from PREBOOK, not search —
// search rates are indicative. Flow: rates (offerId) → prebook → book.
//
// 1) PREBOOK — POST /rates/prebook  (book host). Re-checks live availability + returns the
//    FINAL price, a fresh rate, a prebookId, and price/cancellation/board "changed" flags.
//    Set usePaymentSdk:true to collect the guest card via LiteAPI's SDK (returns secretKey +
//    transactionId for the TRANSACTION payment method).
// export function prebook(body: { offerId: string; usePaymentSdk?: boolean; voucherCode?: string }) {
//   return liteApiFetch<unknown>("/rates/prebook", { method: "POST", base: "book", body: JSON.stringify(body) });
// }
//
// 2) BOOK — POST /rates/book  (book host). Needs prebookId + holder + guests[] + payment.
//    payment.method: WALLET/CREDIT (pay from our LiteAPI balance) | TRANSACTION (+transactionId,
//    guest card via SDK) | ACC_CREDIT_CARD (sandbox test). clientReference = idempotency key.
// export function book(body: {
//   prebookId: string;
//   holder: { firstName: string; lastName: string; email: string };
//   guests: { occupancyNumber: number; firstName: string; lastName: string; email?: string }[];
//   payment: { method: "WALLET" | "CREDIT" | "TRANSACTION" | "ACC_CREDIT_CARD"; transactionId?: string };
//   clientReference?: string;
// }) {
//   return liteApiFetch<unknown>("/rates/book", { method: "POST", base: "book", body: JSON.stringify(body) });
// }
//
// 3) MANAGE — GET /bookings/{id} (retrieve), PUT /bookings/{id} (cancel). Both on the book host.
//
// Rate limit: 500 RPS/customer across endpoints; add exponential-backoff retry on HTTP 429.
// Merchant-of-record + Seller-of-Travel: NOT resolved by the docs — confirm with LiteAPI in
// writing before taking real money (see docs/PRICING.md §6 and docs/POSITIONING.md).
