import { NextResponse } from "next/server";
import { getPrices, defaultDates } from "@/lib/rates";
import { logRates } from "@/lib/priceLog";
import { authServer } from "@/lib/authServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body.hotelIds) ? body.hotelIds.slice(0, 100) : [];
    const adults = Number(body.adults) || 2;
    const { checkin, checkout } = defaultDates(body.checkin, body.checkout);
    const prices = await getPrices(ids, checkin, checkout, adults);
    await logRates(prices); // best-effort: seed our own price-history index for "good deal" signals (never throws)

    // The member price (below SSP) is for logged-in users only — LiteAPI permits "discounts to logged-in
    // users only". Strip it for everyone else (clone so the shared price cache keeps its member field).
    const { data } = await (await authServer()).auth.getUser();
    if (!data.user) {
      const pub: typeof prices = {};
      for (const [id, p] of Object.entries(prices)) {
        const clone = { ...p };
        delete clone.member;
        pub[id] = clone;
      }
      return NextResponse.json({ prices: pub });
    }
    return NextResponse.json({ prices });
  } catch (e) {
    // never break the page — just return no prices
    return NextResponse.json({ prices: {}, error: String(e) });
  }
}
