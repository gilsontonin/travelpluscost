import { NextResponse } from "next/server";
import { getOwner } from "@/lib/authServer";
import { getOwnerRates, defaultDates } from "@/lib/rates";
import { hotelsByCity, hotelsByCityFuzzy } from "@/lib/directory";

// OWNER-ONLY: real-time price breakdown for a city — net cost, SSP, member price, and margins. Hard-gated on
// getOwner() (OWNER_EMAIL); a non-owner gets 403 and never sees net. Resolves a city → directory hotels →
// live rates.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const city = String(body.city ?? "").trim();
  const adults = Number(body.adults) || 2;
  const { checkin, checkout } = defaultDates(body.checkin, body.checkout);
  if (!city) return NextResponse.json({ rows: [], checkin, checkout, city: "" });

  let hotels = await hotelsByCity(city, "us", 40);
  if (!hotels.length) hotels = await hotelsByCityFuzzy(city.toLowerCase().replace(/\s+/g, "-"), "us", 40);
  const ids = hotels.map((h) => h.id);
  const rates = await getOwnerRates(ids, checkin, checkout, adults);

  const rows = hotels
    .map((h) => {
      const r = rates[h.id];
      if (!r) return null;
      const marginSSP = Math.round(r.ssp - r.net); // what we keep if the public books at SSP
      const marginMember = Math.round(r.member - r.net); // what we keep if a member books
      return {
        id: h.id,
        name: h.name,
        net: Math.round(r.net),
        ssp: Math.round(r.ssp),
        member: Math.round(r.member),
        atProperty: Math.round(r.atProperty),
        marginSSP,
        marginMember,
        spreadPct: Math.round((100 * (r.ssp - r.net)) / r.net), // SSP over net
        refundable: r.refundable,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ rows, checkin, checkout, city });
}
