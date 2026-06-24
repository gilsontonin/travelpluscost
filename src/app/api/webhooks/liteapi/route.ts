// LiteAPI / Nuitee Connect webhook receiver.
//
// Why this exists: LiteAPI fires server-side events on booking lifecycle changes. We use the
// `booking.book` event to send the guest's confirmation email (src/lib/email.ts) — robust because it
// fires from LiteAPI even if the guest closed the tab before /booking-complete rendered, and it's the
// natural home for cancel/refund/amendment handling later (fall back on their system, don't reinvent).
//
// Register in dashboard → Developer tools → Webhooks: HTTPS URL = https://travelpluscost.com/api/
// webhooks/liteapi, set an auth token = LITEAPI_WEBHOOK_SECRET, subscribe to booking.book (add
// booking.cancel/.refund/.amendment when we wire record-keeping).
//
// Gotchas handled (per docs): the envelope's `request`/`response` are STRINGIFIED JSON (parse twice);
// delivery is at-least-once (we dedupe on `event_id`); a 2xx ack stops retries, a 5xx triggers one.
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { redis } from "@/lib/redis";
import { getDirectoryHotel } from "@/lib/directory";
import { sendBookingConfirmation, directionsUrl, ABS, type BookingEmailData } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Envelope LiteAPI POSTs us. `request`/`response` are stringified JSON, not objects.
interface WebhookEnvelope {
  event_id?: string;
  event_name?: string;
  request?: unknown;
  response?: unknown;
  sandbox?: boolean;
}

// The subset of POST /rates/book's response we need for the receipt (verified shape, 2026-06-23).
// Note: the book response has NO at-property fee field — those live only in the rate, so the emailed
// total is the amount charged online (the email omits the at-property line the on-screen page shows).
interface BookData {
  bookingId?: string;
  hotelConfirmationCode?: string;
  status?: string;
  checkin?: string;
  checkout?: string;
  hotel?: { hotelId?: string; name?: string };
  bookedRooms?: { roomType?: { name?: string }; boardName?: string; guests?: { email?: string }[] }[];
  holder?: { firstName?: string; lastName?: string; email?: string };
  cancellationPolicies?: { refundableTag?: string };
  price?: number;
  currency?: string;
  lastFreeCancellationDate?: string;
  sandbox?: boolean;
}

// ── Dedup: claim an event_id so retries / concurrent deliveries don't double-send. Redis when
// configured (survives cold starts), else a best-effort in-memory set (a double email is low-harm). ──
const mem = new Set<string>();
const KEY = (id: string) => `wh:evt:${id}`;
const DEDUP_TTL = 60 * 60 * 24 * 7; // 7 days

async function claim(eventId: string): Promise<boolean> {
  if (!eventId) return true; // no id to dedup on — process it
  if (serverEnv.UPSTASH_REDIS_REST_URL) {
    try {
      const ok = await redis().set(KEY(eventId), "1", { nx: true, ex: DEDUP_TTL });
      return ok !== null; // "OK" => newly claimed; null => key existed => already handled
    } catch (e) {
      console.warn("[webhook] redis dedup unavailable, using memory:", e);
    }
  }
  if (mem.has(eventId)) return false;
  mem.add(eventId);
  return true;
}

async function release(eventId: string): Promise<void> {
  if (!eventId) return;
  if (serverEnv.UPSTASH_REDIS_REST_URL) {
    try {
      await redis().del(KEY(eventId));
      return;
    } catch {
      /* fall through */
    }
  }
  mem.delete(eventId);
}

function parseBooking(envlp: WebhookEnvelope): BookData | null {
  let parsed: unknown = envlp.response;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as { data?: BookData };
  return obj.data ?? (parsed as BookData);
}

function fmtDate(d: string): string {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function buildEmail(b: BookData, sandbox: boolean): Promise<BookingEmailData | null> {
  const to = (b.holder?.email || b.bookedRooms?.[0]?.guests?.[0]?.email || "").trim();
  if (!to) return null; // nothing to send to

  // Enrich location + map pin from our directory (the book response only carries hotelId + name).
  let location = "";
  let lat: number | null = null;
  let lng: number | null = null;
  const hotelId = b.hotel?.hotelId ?? "";
  if (hotelId) {
    try {
      const dh = await getDirectoryHotel(hotelId);
      if (dh) {
        location = [dh.city, dh.state].filter(Boolean).join(", ");
        lat = dh.lat;
        lng = dh.lng;
      }
    } catch (e) {
      console.warn("[webhook] directory lookup failed:", e);
    }
  }

  const hotelName = b.hotel?.name ?? "your hotel";
  const bookingId = b.bookingId ?? "";
  const online = typeof b.price === "number" ? b.price : 0;
  const refundable = b.cancellationPolicies?.refundableTag === "RFN";
  const freeCancelBefore = (b.lastFreeCancellationDate ?? "").slice(0, 10);
  const cancelLabel = refundable
    ? freeCancelBefore
      ? `Free cancellation before ${fmtDate(freeCancelBefore)}`
      : "Fully refundable"
    : "Non-refundable";

  return {
    to,
    guestName: [b.holder?.firstName, b.holder?.lastName].filter(Boolean).join(" ").trim(),
    hotelName,
    hotelLocation: location,
    ref: b.hotelConfirmationCode || bookingId || "—",
    bookingId,
    room: b.bookedRooms?.[0]?.roomType?.name || "Room",
    checkin: b.checkin ?? "",
    checkout: b.checkout ?? "",
    online,
    feesAtProperty: 0, // not in the book response (rate-only); emailed total = amount charged
    total: online,
    currency: b.currency ?? "USD",
    cancelLabel,
    directionsUrl: directionsUrl(lat, lng, [hotelName, location].filter(Boolean).join(", ")),
    manageUrl: ABS(bookingId ? `/cancel?bookingId=${encodeURIComponent(bookingId)}` : "/cancel"),
    sandbox,
  };
}

export async function POST(req: Request) {
  // 1) Verify the shared secret (when configured). LiteAPI sends it as the Authorization header value.
  const secret = serverEnv.LITEAPI_WEBHOOK_SECRET;
  if (secret) {
    const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (got !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  } else {
    console.warn("[webhook] LITEAPI_WEBHOOK_SECRET unset — accepting unverified webhook calls.");
  }

  // 2) Parse the envelope.
  let envlp: WebhookEnvelope;
  try {
    envlp = (await req.json()) as WebhookEnvelope;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const eventName = envlp.event_name ?? "";
  const eventId = envlp.event_id ?? "";

  // 3) We only act on booking.book today. Ack everything else so LiteAPI stops retrying it.
  if (eventName !== "booking.book") {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  // 4) Dedupe (at-least-once delivery).
  if (!(await claim(eventId))) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  try {
    const booking = parseBooking(envlp);
    if (!booking) {
      console.error("[webhook] booking.book had no parseable booking payload");
      return NextResponse.json({ ok: true, skipped: "no-payload" }); // bad shape won't fix on retry
    }
    const sandbox = Boolean(envlp.sandbox ?? booking.sandbox);
    const data = await buildEmail(booking, sandbox);
    if (!data) return NextResponse.json({ ok: true, skipped: "no-recipient" });

    const res = await sendBookingConfirmation(data);
    if (res.sent) return NextResponse.json({ ok: true, sent: true });

    // Transient failures (rate-limit / 5xx / network) should retry; config issues (no key, bad
    // domain) should not — release the claim only for the retryable case.
    const transient = res.reason === "exception" || /^resend-(429|5\d\d)$/.test(res.reason ?? "");
    if (transient) {
      await release(eventId);
      return NextResponse.json({ error: res.reason }, { status: 500 });
    }
    return NextResponse.json({ ok: true, skipped: res.reason });
  } catch (e) {
    await release(eventId); // let LiteAPI retry an unexpected failure
    console.error("[webhook] booking.book handler failed:", e);
    return NextResponse.json({ error: "handler-failed" }, { status: 500 });
  }
}

// A browser GET is handy to confirm the route is deployed (LiteAPI only ever POSTs).
export function GET() {
  return NextResponse.json({ ok: true, endpoint: "liteapi-webhook", method: "POST" });
}
