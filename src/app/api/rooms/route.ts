import { NextResponse } from "next/server";
import { getRooms, defaultDates } from "@/lib/rates";
import { authServer } from "@/lib/authServer";

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
    // Member price (below SSP) is for logged-in users only — strip it for everyone else (clone so the
    // shared rooms cache keeps it). Same gating as /api/prices, so the property page matches the card.
    const { data: auth } = await (await authServer()).auth.getUser();
    if (!auth.user) {
      const offers = data.offers.map((o) => {
        const price = { ...o.price };
        delete price.member;
        return { ...o, price };
      });
      return NextResponse.json({ offers, nights: data.nights, checkin, checkout });
    }
    return NextResponse.json({ ...data, checkin, checkout });
  } catch (e) {
    return NextResponse.json({ offers: [], nights: 1, error: String(e) });
  }
}
