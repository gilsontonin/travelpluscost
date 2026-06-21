import { NextResponse } from "next/server";
import { getPrices, defaultDates } from "@/lib/rates";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body.hotelIds) ? body.hotelIds.slice(0, 60) : [];
    const adults = Number(body.adults) || 2;
    const { checkin, checkout } = defaultDates(body.checkin, body.checkout);
    const prices = await getPrices(ids, checkin, checkout, adults);
    return NextResponse.json({ prices });
  } catch (e) {
    // never break the page — just return no prices
    return NextResponse.json({ prices: {}, error: String(e) });
  }
}
