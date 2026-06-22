import { NextResponse } from "next/server";
import { vibeSearch } from "@/lib/vibeSearch";
import { defaultDates } from "@/lib/rates";

// Natural-language "search by vibe" (LiteAPI aiSearch). Called client-side on submit (it's a slow,
// paid call), so VibeResults can show a loading state. Server-side keeps the API key off the client.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const q = (sp.get("q") ?? "").trim();
    if (!q) return NextResponse.json({ hotels: [] });
    const adults = Number(sp.get("adults")) || 2;
    const { checkin, checkout } = defaultDates(sp.get("checkin"), sp.get("checkout"));
    const hotels = await vibeSearch(q, checkin, checkout, adults);
    return NextResponse.json({ hotels });
  } catch (e) {
    return NextResponse.json({ hotels: [], error: String(e) });
  }
}
