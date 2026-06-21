// Local hotel CONTENT store (ingested from LiteAPI -> content/oahu.json).
// Served instantly (no live API call for content). Scales: ingest more -> bigger JSON / a DB.
import oahuData from "../../content/oahu.json";
import { nearbyLabel, haversineMiles } from "./distance";

export interface Room {
  name: string;
  summary: string;
  features: string[];
  view: string | null;
  sqft: number | null;
  sleeps: number | null;
  beds: { qty: number; type: string }[];
  amenities: string[];
  photos: string[];
}

export interface OahuHotel {
  id: string;
  name: string;
  island: string;
  city: string;
  address: string;
  stars: number | null;
  rating: number | null; // out of 10
  reviewCount: number | null;
  image: string;
  images: string[];
  facilities: string[];
  description: string;
  chain: string | null;
  hotelType: string | null;
  petsAllowed: boolean | null;
  childAllowed: boolean | null;
  importantInfo: string | null;
  policies: { name: string; description: string }[];
  reviewsUpdated: string | null;
  airportCode: string | null;
  lat: number | null;
  lng: number | null;
  checkin: string | null;
  checkout: string | null;
  rooms: Room[];
  sentiment: {
    categories: { name: string; rating: number }[];
    pros: string[];
    cons: string[];
  } | null;
}

// LiteAPI hotelType → clean label + category (hotel vs vacation rental).
// We sell all of them (they all come from the hotel channels, NOT Airbnb), but label/filter them.
const TYPE_LABELS: Record<string, string> = {
  hotels: "Hotel",
  resorts: "Resort",
  "holiday homes": "Vacation home",
  "private vacation home": "Vacation home",
  apartments: "Apartment",
  condos: "Condo",
  villas: "Villa",
  houseboat: "Houseboat",
  aparthotels: "Aparthotel",
};
const RENTAL_TYPES = new Set([
  "holiday homes",
  "private vacation home",
  "apartments",
  "condos",
  "villas",
  "houseboat",
]);

export type StayCategory = "hotel" | "rental";

export function classifyType(hotelType: string | null): { label: string; category: StayCategory } {
  const lower = (hotelType ?? "").trim().toLowerCase();
  const label = TYPE_LABELS[lower] ?? "";
  return { label, category: RENTAL_TYPES.has(lower) ? "rental" : "hotel" };
}

// Lightweight shape for result cards (keeps the search payload small — only what HotelRow renders).
export type CardHotel = Pick<
  OahuHotel,
  "id" | "name" | "city" | "address" | "image" | "stars" | "rating" | "reviewCount"
> & {
  images: string[];
  amenities: string[];
  lat: number | null;
  lng: number | null;
  nearby: string | null;
  propertyType: string;
  category: StayCategory;
};

// Ordered by "card-worthiness" — detectAmenities returns matches in this order,
// so the first few shown on a result card are the ones guests actually filter on.
const AMENITY_MATCHERS: [string, RegExp][] = [
  ["Pool", /pool|swimming/i],
  ["Free WiFi", /wi-?fi|internet/i],
  ["Beachfront", /beach|oceanfront/i],
  ["Parking", /parking/i],
  ["Breakfast", /breakfast/i],
  ["Spa", /\bspa\b/i],
  ["Gym", /gym|fitness/i],
  ["Restaurant", /restaurant|dining/i],
  ["Bar", /\bbar\b|lounge/i],
  ["Hot tub", /hot tub|jacuzzi|whirlpool/i],
  ["Air conditioning", /air ?conditioning|\ba\/c\b/i],
  ["Room service", /room service/i],
  ["Airport shuttle", /shuttle|airport transfer/i],
  ["Laundry", /laundry|washer|dry clean/i],
  ["Kitchen", /kitchen/i],
  ["Business center", /business cent|meeting room|conference/i],
  ["EV charging", /(electric|ev).{0,12}charg|charging station/i],
  ["Pet-friendly", /\bpets?\b/i],
  ["Accessible", /accessible|wheelchair|disab/i],
  ["Family rooms", /family/i],
];
export const ALL_AMENITIES = AMENITY_MATCHERS.map(([name]) => name);

export function detectAmenities(facilities: string[]): string[] {
  const text = facilities.join(" | ");
  return AMENITY_MATCHERS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

// Minimal shape for home rails / recently-viewed (small client payload).
export interface RailHotel {
  id: string;
  name: string;
  image: string;
  city: string;
  rating: number | null;
  reviewCount: number | null;
  propertyType: string;
}

export function toRail(h: OahuHotel): RailHotel {
  return {
    id: h.id,
    name: h.name,
    image: h.image,
    city: h.city,
    rating: h.rating,
    reviewCount: h.reviewCount,
    propertyType: classifyType(h.hotelType).label,
  };
}

export function toCard(h: OahuHotel): CardHotel {
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    address: h.address,
    image: h.image,
    images: h.images.slice(0, 6),
    stars: h.stars,
    rating: h.rating,
    reviewCount: h.reviewCount,
    amenities: detectAmenities(h.facilities),
    lat: h.lat,
    lng: h.lng,
    nearby: nearbyLabel(h.lat, h.lng),
    propertyType: classifyType(h.hotelType).label,
    category: classifyType(h.hotelType).category,
  };
}

const HOTELS = oahuData as OahuHotel[];

// queries that map to "show all Oahu"
const OAHU_TERMS = ["oahu", "hawaii", "honolulu", "waikiki", "kapolei", "kailua", "ko olina", "koolina"];

export function getAllOahu(): OahuHotel[] {
  return HOTELS;
}

export function getOahuHotel(id: string): OahuHotel | null {
  return HOTELS.find((h) => h.id === id) ?? null;
}

/** The closest other hotels in our set (for "Other places to stay nearby"). */
export function getNearbyHotels(id: string, limit = 6): { hotel: OahuHotel; miles: number }[] {
  const self = getOahuHotel(id);
  if (!self || self.lat == null || self.lng == null) return [];
  return HOTELS.filter((h) => h.id !== id && h.lat != null && h.lng != null && h.image)
    .map((h) => ({ hotel: h, miles: haversineMiles(self.lat as number, self.lng as number, h.lat as number, h.lng as number) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, limit);
}

/** Search the local Oahu set. Returns all Oahu for island-wide queries, filters by city when given,
 * and returns [] for places we haven't ingested yet (honest "we only have Oahu right now"). */
export function searchOahu(query: string): OahuHotel[] {
  const q = query.trim().toLowerCase();
  if (!q) return HOTELS;
  const isOahu = OAHU_TERMS.some((t) => q.includes(t) || t.includes(q));
  if (!isOahu) return [];
  const byCity = HOTELS.filter((h) => h.city.toLowerCase().includes(q));
  return byCity.length ? byCity : HOTELS;
}
