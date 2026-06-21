import { NextResponse } from "next/server";
import { getAllHotels } from "@/lib/hotels";
import { REGIONS } from "@/lib/regions";
import { getRates } from "@/lib/liteapi";
import { defaultDates } from "@/lib/rates";

// PRIVATE — returns NET (your cost) + SSP per hotel. Passphrase-gated; never public.
export const dynamic = "force-dynamic";

interface RateLite {
  retailRate?: { total?: { amount: number }[]; suggestedSellingPrice?: { amount: number }[] };
}
interface RoomTypeLite {
  rates?: RateLite[];
}
interface HotelRates {
  hotelId: string;
  roomTypes?: RoomTypeLite[];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const k = url.searchParams.get("k") ?? "";
  const secret = process.env.COMPARE_SECRET ?? "";
  if (!secret || k !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const regionSlug = url.searchParams.get("region") ?? "oahu";
  const region = REGIONS.find((r) => r.slug === regionSlug) ?? REGIONS[0];
  const { checkin, checkout } = defaultDates(url.searchParams.get("checkin"), url.searchParams.get("checkout"));
  const limit = Math.min(Number(url.searchParams.get("limit")) || 30, 40);

  const hotels = getAllHotels()
    .filter((h) => h.island.toLowerCase() === region.name.toLowerCase())
    .slice(0, limit);
  const ids = hotels.map((h) => String(h.id));

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20));

  const datas = await Promise.all(
    chunks.map((c) =>
      getRates({ hotelIds: c, checkin, checkout, occupancies: [{ adults: 2 }], currency: "USD", guestNationality: "US" })
        .then((r) => (r as { data?: HotelRates[] }).data ?? [])
        .catch(() => [] as HotelRates[]),
    ),
  );

  const best = new Map<string, { net: number; ssp: number | null }>();
  for (const data of datas) {
    for (const rh of data) {
      let pick: { net: number; ssp: number | null } | null = null;
      for (const rt of rh.roomTypes ?? []) {
        for (const rate of rt.rates ?? []) {
          const net = rate.retailRate?.total?.[0]?.amount;
          const ssp = rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
          if (typeof net === "number" && (!pick || net < pick.net)) {
            pick = { net, ssp: typeof ssp === "number" ? ssp : null };
          }
        }
      }
      if (pick) best.set(String(rh.hotelId), pick);
    }
  }

  const rows = hotels.map((h) => {
    const r = best.get(String(h.id));
    return { id: h.id, name: h.name, city: h.city, net: r?.net ?? null, ssp: r?.ssp ?? null };
  });

  return NextResponse.json({ checkin, checkout, region: region.label, rows });
}
