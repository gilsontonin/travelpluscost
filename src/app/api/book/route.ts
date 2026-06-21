import { NextResponse } from "next/server";
import { sandboxBook, type BookingInput } from "@/lib/booking";

// SANDBOX booking — creates a real test reservation (no charge). Never wired to the
// production key. See src/lib/booking.ts.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Partial<BookingInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const required = ["hotelId", "room", "checkin", "checkout", "firstName", "lastName", "email"] as const;
  for (const k of required) {
    if (!body[k]) return NextResponse.json({ error: `Missing ${k}.` }, { status: 400 });
  }

  try {
    const result = await sandboxBook({
      hotelId: String(body.hotelId),
      room: String(body.room),
      checkin: String(body.checkin),
      checkout: String(body.checkout),
      adults: Number(body.adults) || 2,
      firstName: String(body.firstName),
      lastName: String(body.lastName),
      email: String(body.email),
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Booking failed." },
      { status: 502 },
    );
  }
}
