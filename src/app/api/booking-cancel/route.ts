import { NextResponse } from "next/server";
import { retrieveBooking, cancelBooking } from "@/lib/booking";

// Cancel a booking from the self-serve page. Re-verifies the email against the holder server-side
// (never trusts the client) before issuing the PUT, so only the booking owner can cancel. The
// refund amount comes straight from LiteAPI's cancel response (per the room's cancellation policy).
export const dynamic = "force-dynamic";

const NOT_FOUND = "We couldn't find a booking with that ID and email. Check both and try again.";

export async function POST(req: Request) {
  let body: { bookingId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const bookingId = String(body.bookingId ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!bookingId || !email) {
    return NextResponse.json({ error: "Enter your booking ID and email." }, { status: 400 });
  }

  try {
    const b = await retrieveBooking(bookingId);
    if (!b.holderEmail || b.holderEmail !== email) {
      return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    }
    if (b.cancelled) {
      return NextResponse.json({ alreadyCancelled: true, status: b.status, currency: b.currency });
    }
    const result = await cancelBooking(bookingId);
    return NextResponse.json(result);
  } catch (e) {
    // A genuine retrieve mismatch reads as not-found; a cancel-side failure is a real error.
    const msg = e instanceof Error ? e.message : "";
    if (/40[34]|not found/i.test(msg)) return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    return NextResponse.json({ error: "We couldn't cancel this booking. Please try again or contact us." }, { status: 502 });
  }
}
