import { NextResponse } from "next/server";
import { hotelsNear, hotelsByCity, rankHotels, directoryToCard } from "@/lib/directory";
import type { DirectoryHotel } from "@/lib/directory";

// "Stays near you" — contextual DISCOVERY only (never pricing; prices stay flat for everyone).
// Uses Netlify's free geo (x-nf-geo header: city/subdivision/lat/lng) → hotelsNear/hotelsByCity.
// Returns empty (rail self-hides) when there's no geo — e.g. local dev or a non-US visitor.
export const dynamic = "force-dynamic";

interface Geo {
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  country: string | null;
}

function parseGeo(req: Request): Geo {
  const raw = req.headers.get("x-nf-geo");
  if (raw) {
    try {
      const g = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
      return {
        city: g.city ?? null,
        state: g.subdivision?.name ?? g.subdivision?.code ?? null,
        lat: typeof g.latitude === "number" ? g.latitude : null,
        lng: typeof g.longitude === "number" ? g.longitude : null,
        country: g.country?.code ?? null,
      };
    } catch {
      /* malformed header → no geo */
    }
  }
  return { city: null, state: null, lat: null, lng: null, country: null };
}

export async function GET(req: Request) {
  try {
    const geo = parseGeo(req);
    if (geo.country && geo.country !== "US") return NextResponse.json({ cards: [] }); // US-only inventory for now

    let rows: DirectoryHotel[] = [];
    if (geo.lat != null && geo.lng != null) rows = await hotelsNear(geo.lat, geo.lng, 60, 40); // ~60km metro radius
    if (!rows.length && geo.city) rows = await hotelsByCity(geo.city, "us", 40);
    if (!rows.length) return NextResponse.json({ cards: [] });

    const cards = rankHotels(rows).slice(0, 12).map(directoryToCard);
    const label = geo.city ? `Stays near ${geo.city}` : geo.state ? `Popular in ${geo.state}` : "Stays near you";
    const subtitle = geo.city && geo.state ? geo.state : "Same price for everyone — never based on your location";
    return NextResponse.json({ cards, label, subtitle });
  } catch (e) {
    return NextResponse.json({ cards: [], error: String(e) });
  }
}
