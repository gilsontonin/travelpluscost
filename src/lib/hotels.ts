// Hotel data service — normalizes LiteAPI responses into UI-ready shapes.
// Public pages show the Suggested Selling Price (parity-safe); the net cost stays hidden.
import { getHotels, getHotelDetails, getRates } from "./liteapi";

export interface HotelCardData {
  id: string;
  name: string;
  city?: string;
  address?: string;
  image?: string;
  stars?: number;
  rating?: number; // LiteAPI rating is out of 10
  reviewCount?: number;
  price?: { amount: number; currency: string; nights: number; perNight: number };
}

export interface HotelDetail {
  id: string;
  name: string;
  description?: string;
  images: { url: string; caption?: string }[];
  facilities: string[];
  stars?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  checkin?: string;
  checkout?: string;
}

export interface RoomOffer {
  offerId: string;
  roomName: string;
  boardName?: string;
  refundable: boolean;
  price: { amount: number; currency: string; nights: number; perNight: number };
}

// ---- raw LiteAPI shapes (only the fields we use) ----
interface RawHotel {
  id: string;
  name: string;
  city?: string;
  address?: string;
  main_photo?: string;
  thumbnail?: string;
  stars?: number;
  rating?: number;
  reviewCount?: number;
}
interface Money {
  amount: number;
  currency: string;
}
interface RateObj {
  rateId?: string;
  name?: string;
  boardName?: string;
  cancellationPolicies?: { refundableTag?: string } | unknown;
  retailRate?: { suggestedSellingPrice?: Money[]; total?: Money[] };
}
interface RoomType {
  offerId?: string;
  rates?: RateObj[];
}
interface RatesHotel {
  hotelId: string;
  roomTypes?: RoomType[];
}
interface RawDetail {
  id?: string;
  name?: string;
  hotelDescription?: string;
  hotelImages?: { url?: string; urlHd?: string; caption?: string }[];
  facilities?: string[];
  starRating?: number;
  stars?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  checkinCheckoutTimes?: { checkin_start?: string; checkout?: string };
}

// "Oahu" is an island, not a LiteAPI city — map common island queries to their main city.
const CITY_ALIASES: Record<string, string> = {
  oahu: "Honolulu",
  waikiki: "Honolulu",
  maui: "Lahaina",
  "big island": "Kailua-Kona",
  kauai: "Lihue",
};
function resolveCity(input: string): string {
  return CITY_ALIASES[input.trim().toLowerCase()] ?? input;
}

function stripHtml(html?: string): string | undefined {
  if (!html) return undefined;
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function nightsBetween(checkin: string, checkout: string) {
  const n = Math.round((Date.parse(checkout) - Date.parse(checkin)) / 86_400_000);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function priced(m: Money, nights: number) {
  return { amount: m.amount, currency: m.currency, nights, perNight: Math.max(1, Math.round(m.amount / nights)) };
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
  const limit = opts?.limit ?? 24;
  const resolved = resolveCity(cityName);
  const hotelsRes = (await getHotels({ countryCode: "US", cityName: resolved, limit })) as { data?: RawHotel[] };
  const hotels = hotelsRes?.data ?? [];
  if (hotels.length === 0) return [];

  const { checkin, checkout } = defaultDates(opts?.checkin, opts?.checkout);
  const nights = nightsBetween(checkin, checkout);
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
    })) as { data?: RatesHotel[] };
    for (const rh of ratesRes?.data ?? []) {
      const ssp = cheapestSSP(rh);
      if (ssp) priceMap.set(rh.hotelId, ssp);
    }
  } catch {
    // prices optional — show hotels even if rates fail
  }

  return hotels.map((h) => {
    const m = priceMap.get(h.id);
    return {
      id: h.id,
      name: h.name,
      city: h.city,
      address: h.address,
      image: h.main_photo || h.thumbnail,
      stars: h.stars,
      rating: h.rating,
      reviewCount: h.reviewCount,
      price: m ? priced(m, nights) : undefined,
    };
  });
}

export async function getHotel(id: string): Promise<HotelDetail | null> {
  const res = (await getHotelDetails(id)) as { data?: RawDetail } | RawDetail;
  const d: RawDetail = (res as { data?: RawDetail })?.data ?? (res as RawDetail);
  if (!d || !d.name) return null;
  return {
    id: d.id ?? id,
    name: d.name,
    description: stripHtml(d.hotelDescription),
    images: (d.hotelImages ?? [])
      .map((im) => ({ url: im.urlHd || im.url || "", caption: im.caption }))
      .filter((im) => im.url),
    facilities: d.facilities ?? [],
    stars: d.starRating ?? d.stars,
    rating: d.rating,
    reviewCount: d.reviewCount,
    address: d.address,
    city: d.city,
    checkin: d.checkinCheckoutTimes?.checkin_start,
    checkout: d.checkinCheckoutTimes?.checkout,
  };
}

export async function getRoomOffers(
  hotelId: string,
  opts?: { checkin?: string; checkout?: string; adults?: number; limit?: number },
): Promise<{ offers: RoomOffer[]; checkin: string; checkout: string; nights: number }> {
  const { checkin, checkout } = defaultDates(opts?.checkin, opts?.checkout);
  const nights = nightsBetween(checkin, checkout);
  const adults = opts?.adults ?? 2;
  const limit = opts?.limit ?? 6;

  let offers: RoomOffer[] = [];
  try {
    const ratesRes = (await getRates({
      hotelIds: [hotelId],
      checkin,
      checkout,
      occupancies: [{ adults }],
      currency: "USD",
      guestNationality: "US",
    })) as { data?: RatesHotel[] };
    const rh = ratesRes?.data?.[0];
    for (const rt of rh?.roomTypes ?? []) {
      const r = rt.rates?.[0];
      const sp = r?.retailRate?.suggestedSellingPrice?.[0];
      if (rt.offerId && r && sp) {
        offers.push({
          offerId: rt.offerId,
          roomName: r.name ?? "Room",
          boardName: r.boardName,
          refundable: Array.isArray((r as RateObj).cancellationPolicies)
            ? ((r as RateObj).cancellationPolicies as unknown[]).length > 0
            : false,
          price: priced({ amount: sp.amount, currency: sp.currency }, nights),
        });
      }
    }
  } catch {
    // no offers — page still renders
  }
  offers = offers.sort((a, b) => a.price.amount - b.price.amount).slice(0, limit);
  return { offers, checkin, checkout, nights };
}
