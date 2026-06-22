import { NextResponse } from "next/server";
import { sandboxPrebook, type PrebookInput } from "@/lib/booking";

// SANDBOX prebook — returns the Stripe secretKey + transactionId the client Payment SDK needs.
// No charge happens here. See src/lib/booking.ts.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Partial<PrebookInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  for (const k of ["hotelId", "room", "checkin", "checkout"] as const) {
    if (!body[k]) return NextResponse.json({ error: `Missing ${k}.` }, { status: 400 });
  }

  try {
    const result = await sandboxPrebook({
      hotelId: String(body.hotelId),
      room: String(body.room),
      checkin: String(body.checkin),
      checkout: String(body.checkout),
      adults: Number(body.adults) || 2,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Prebook failed." },
      { status: 502 },
    );
  }
}
