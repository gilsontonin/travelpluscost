// Hotel search service — normalizes LiteAPI responses into UI-ready cards.
// Public pages show the Suggested Selling Price (parity-safe); the net cost stays hidden.
import { getHotels, getRates } from "./liteapi";

export interface HotelCardData {
  id: string;
  name: string;
  city?: string;
  address?: string;
  image?: string;
  stars?: number;
  rating?: number; // LiteAPI rating is out of 10
  reviewCount?: number;
  price?: { amount: number; currency: string };
}

// ---- raw LiteAPI shapes (only the fields we use) ----
interface RawHotel {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  main_photo?: string;
  thumbnail?: string;
  stars?: number;
  rating?: number;
  reviewCount?: number;
}
interface HotelsResponse {
  data?: RawHotel[];
}
interface Money {
  amount: number;
  currency: string;
}
interface RateObj {
  retailRate?: { suggestedSellingPrice?: Money[]; total?: Money[] };
}
interface RoomType {
  rates?: RateObj[];
}
interface RatesHotel {
  hotelId: string;
  roomTypes?: RoomType[];
}
interface RatesResponse {
  data?: RatesHotel[];
}

function defaultDates(checkin?: string, checkout?: string) {
  if (checkin && checkout) return { checkin, checkout };
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const ci = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 2);
  const co = d.toISOString().slice(0, 10);
  return { checkin: ci, checkout: co };
}

function cheapestSSP(rh: RatesHotel): Money | undefined {
  let best: Money | undefined;
  for (const rt of rh.roomTypes ?? []) {
    for (const r of rt.rates ?? []) {
      const sp = r.retailRate?.suggestedSellingPrice?.[0];
      if (sp && typeof sp.amount === "number" && (!best || sp.amount < best.amount)) {
        best = { amount: sp.amount, currency: sp.currency };
      }
    }
  }
  return best;
}

export async function searchHotels(
  cityName: string,
  opts?: { checkin?: string; checkout?: string; adults?: number; limit?: number },
): Promise<HotelCardData[]> {
  const limit = opts?.limit ?? 21;
  const hotelsRes = (await getHotels({ countryCode: "US", cityName, limit })) as HotelsResponse;
  const hotels = hotelsRes?.data ?? [];
  if (hotels.length === 0) return [];

  const { checkin, checkout } = defaultDates(opts?.checkin, opts?.checkout);
  const adults = opts?.adults ?? 2;

  const priceMap = new Map<string, Money>();
  try {
    const ratesRes = (await getRates({
      hotelIds: hotels.map((h) => h.id),
      checkin,
      checkout,
      occupancies: [{ adults }],
      currency: "USD",
      guestNationality: "US",
    })) as RatesResponse;
    for (const rh of ratesRes?.data ?? []) {
      const ssp = cheapestSSP(rh);
      if (ssp) priceMap.set(rh.hotelId, ssp);
    }
  } catch {
    // prices are optional in the MVP — show hotels even if rates fail
  }

  return hotels.map((h) => ({
    id: h.id,
    name: h.name,
    city: h.city,
    address: h.address,
    image: h.main_photo || h.thumbnail,
    stars: h.stars,
    rating: h.rating,
    reviewCount: h.reviewCount,
    price: priceMap.get(h.id),
  }));
}
