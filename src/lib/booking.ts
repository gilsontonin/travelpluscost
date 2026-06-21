// SANDBOX booking flow — server-only. Runs the real LiteAPI chain (rates -> prebook -> book)
// against the SANDBOX key, so it creates a genuine test reservation with a real confirmation
// code and ZERO charge. NEVER use the production key here — that would take real money, which we
// are not licensed/registered for yet (see docs/PRICING.md §6, docs/LITEAPI.md §6).
//
// Why re-fetch rates here: a prebook needs a SANDBOX offerId, but the offerIds shown on the
// property page come from the PRODUCTION key and aren't valid in sandbox. Sandbox carries the
// same hotel data, so we look the room up again here and use prebook's price as the binding one.
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

export interface BookingInput {
  hotelId: string;
  room: string; // chosen room name (from the property page)
  checkin: string;
  checkout: string;
  adults: number;
  firstName: string;
  lastName: string;
  email: string;
}
export interface BookingResult {
  bookingId: string;
  confirmationCode: string;
  status: string;
  currency: string;
  total: number;
  checkin: string;
  checkout: string;
  room: string;
}

// Find a sandbox offer for the chosen room (canonical match), else the cheapest available.
async function findOffer(input: BookingInput): Promise<{ offerId: string; room: string }> {
  const data = await call<{ hotelId: string; roomTypes?: SandboxRoomType[] }[]>(`${API}/hotels/rates`, {
    hotelIds: [input.hotelId],
    checkin: input.checkin,
    checkout: input.checkout,
    occupancies: [{ adults: input.adults }],
    currency: "USD",
    guestNationality: "US",
  });
  const want = canonRoom(input.room);
  let cheapest: { offerId: string; room: string; price: number } | null = null;
  let match: { offerId: string; room: string } | null = null;
  for (const rh of data ?? []) {
    for (const rt of rh.roomTypes ?? []) {
      for (const rate of rt.rates ?? []) {
        const offerId = rt.offerId ?? rate.offerId;
        const price = rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
        const name = rate.name ?? "Room";
        if (!offerId || typeof price !== "number") continue;
        if (!cheapest || price < cheapest.price) cheapest = { offerId, room: name, price };
        if (!match && canonRoom(name) === want) match = { offerId, room: name };
      }
    }
  }
  const pick = match ?? (cheapest ? { offerId: cheapest.offerId, room: cheapest.room } : null);
  if (!pick) throw new Error("No sandbox availability for this hotel/date.");
  return pick;
}

export async function sandboxBook(input: BookingInput): Promise<BookingResult> {
  const offer = await findOffer(input);

  // 1) prebook — confirms availability + binding price, returns prebookId
  const pre = await call<{ prebookId: string; price?: number; currency?: string }>(
    `${BOOK}/rates/prebook`,
    { offerId: offer.offerId, usePaymentSdk: false },
  );

  // 2) book — sandbox test card (ACC_CREDIT_CARD) = real confirmation, no charge
  const booked = await call<{
    bookingId?: string;
    hotelConfirmationCode?: string;
    status?: string;
    price?: number;
    currency?: string;
  }>(`${BOOK}/rates/book`, {
    prebookId: pre.prebookId,
    holder: { firstName: input.firstName, lastName: input.lastName, email: input.email },
    guests: [
      { occupancyNumber: 1, firstName: input.firstName, lastName: input.lastName, email: input.email },
    ],
    payment: { method: "ACC_CREDIT_CARD" },
  });

  return {
    bookingId: booked.bookingId ?? "—",
    confirmationCode: booked.hotelConfirmationCode ?? booked.bookingId ?? "—",
    status: booked.status ?? "UNKNOWN",
    currency: booked.currency ?? pre.currency ?? "USD",
    total: booked.price ?? pre.price ?? 0,
    checkin: input.checkin,
    checkout: input.checkout,
    room: offer.room,
  };
}
