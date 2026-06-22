import { NextResponse } from "next/server";
import { retrieveBooking } from "@/lib/booking";

// Look up a booking for the self-serve manage/cancel page. Requires BOTH the booking id and the
// email it was made under — the email is verified server-side against the holder, so a booking id
// alone can't expose someone else's reservation. Generic error on any mismatch (no existence leak).
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
    // Strip the holder email from what we send back to the browser.
    const { holderEmail: _omit, ...safe } = b;
    void _omit;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }
}
