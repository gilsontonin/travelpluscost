import { NextResponse } from "next/server";
import { getPrices, defaultDates } from "@/lib/rates";
import { logRates } from "@/lib/priceLog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body.hotelIds) ? body.hotelIds.slice(0, 100) : [];
    const adults = Number(body.adults) || 2;
    const { checkin, checkout } = defaultDates(body.checkin, body.checkout);
    const prices = await getPrices(ids, checkin, checkout, adults);
    await logRates(prices); // best-effort: seed our own price-history index for "good deal" signals (never throws)
    return NextResponse.json({ prices });
  } catch (e) {
    // never break the page — just return no prices
    return NextResponse.json({ prices: {}, error: String(e) });
  }
}
