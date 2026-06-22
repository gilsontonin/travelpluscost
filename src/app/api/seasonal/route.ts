import { NextResponse } from "next/server";
import { hotelsByStates, rankHotels, directoryToCard } from "@/lib/directory";
import { currentSeasonCollection } from "@/lib/seasons";

// Seasonal "hero collection" — picks the season at REQUEST time (so it's always current even though
// the home page is static) and returns top stays in season-appropriate states. Discovery only.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const s = currentSeasonCollection();
    const rows = await hotelsByStates(s.states, 60);
    const cards = rankHotels(rows).slice(0, 12).map(directoryToCard).filter((c) => c.image);
    return NextResponse.json({ cards, title: s.title, subtitle: s.subtitle });
  } catch (e) {
    return NextResponse.json({ cards: [], error: String(e) });
  }
}
