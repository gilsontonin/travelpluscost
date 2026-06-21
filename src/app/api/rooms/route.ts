import { NextResponse } from "next/server";
import { getRooms, defaultDates } from "@/lib/rates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("hotelId") ?? "";
    const adults = Number(url.searchParams.get("adults")) || 2;
    const { checkin, checkout } = defaultDates(
      url.searchParams.get("checkin"),
      url.searchParams.get("checkout"),
    );
    if (!id) return NextResponse.json({ offers: [], nights: 1, checkin, checkout });
    const data = await getRooms(id, checkin, checkout, adults);
    return NextResponse.json({ ...data, checkin, checkout });
  } catch (e) {
    return NextResponse.json({ offers: [], nights: 1, error: String(e) });
  }
}
