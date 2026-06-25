// Multi-region hotel CONTENT store (ingested from LiteAPI -> content/<region>.json).
// Served instantly (no live API call for content). To add a market: ingest its file,
// add it to DATASETS below + a Region entry in regions.ts. (Scales to a DB later — see
// docs/ARCHITECTURE.md — once a single JSON gets too big.)
import oahuData from "../../content/oahu.json";
import mauiData from "../../content/maui.json";
import lasVegasData from "../../content/lasvegas.json";
import seattleData from "../../content/seattle.json";
import sanDiegoData from "../../content/sandiego.json";
import { nearbyLabel, haversineMiles } from "./distance";
import { regionForIsland, resolveRegion, type Region } from "./regions";

// Add a market: ingest -> content/<slug>.json, import it, add it here + to REGIONS in regions.ts.
const DATASETS: Hotel[][] = [
  oahuData as Hotel[],
  mauiData as Hotel[],
  lasVegasData as Hotel[],
  seattleData as Hotel[],
  sanDiegoData as Hotel[],
];

export interface Room {
  ids?: number[]; // LiteAPI room id(s) for this product — a rate's mappedRoomId resolves here
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

// A single guest review (sampled from LiteAPI /data/reviews — see scripts/enrich-reviews.mjs).
export interface Review {
  name: string;
  date: string | null; // YYYY-MM-DD
  score: number | null; // averageScore, out of 10
  type: string | null; // traveller type, e.g. "Family with children"
  headline: string;
  pros: string;
  cons: string;
}

export interface Hotel {
  id: string;
  name: string;
  island: string; // region name (e.g. "Oahu") — maps to a Region in regions.ts
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
  reviews?: Review[]; // individual guest reviews (added by scripts/enrich-reviews.mjs)
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
  Hotel,
  "id" | "name" | "city" | "address" | "image" | "stars" | "rating" | "reviewCount"
> & {
  images: string[];
  amenities: string[];
  lat: number | null;
  lng: number | null;
  nearby: string | null;
  propertyType: string;
  category: StayCategory;
  region: string; // region slug (for distance sort etc.)
  popular?: boolean; // top by review volume in its city — drives the "Popular" card badge
};

// Ordered by "card-worthiness" — detectAmenities returns matches in this order,
// so the first few shown on a result card are the ones guests actually filter on.
const AMENITY_MATCHERS: [string, RegExp][] = [
  ["Pool", /\bpool\b(?! ?table)|swimming/i],
  ["Free WiFi", /wi-?fi|internet/i],
  // True beachfront only — /beach/ alone mis-matched "beach towels/shuttle/club nearby" (see enrich-amenities-bulk.mjs).
  ["Beachfront", /beachfront|oceanfront|on (a |the )?private beach\b|direct access to[\w' -]*\bbeach\b|private beach area/i],
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

export function toRail(h: Hotel): RailHotel {
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

export function toCard(h: Hotel): CardHotel {
  const region = regionForIsland(h.island);
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
    nearby: nearbyLabel(h.lat, h.lng, region.landmarks),
    propertyType: classifyType(h.hotelType).label,
    category: classifyType(h.hotelType).category,
    region: region.slug,
  };
}

const HOTELS: Hotel[] = DATASETS.flat();

export function getAllHotels(): Hotel[] {
  return HOTELS;
}

export function getHotel(id: string): Hotel | null {
  return HOTELS.find((h) => h.id === id) ?? null;
}

/** The region a hotel belongs to (for landmarks/distances). */
export function regionForHotel(h: Hotel): Region {
  return regionForIsland(h.island);
}

/** The closest other hotels in the SAME region (for "Other places to stay nearby"). */
export function getNearbyHotels(id: string, limit = 6): { hotel: Hotel; miles: number }[] {
  const self = getHotel(id);
  if (!self || self.lat == null || self.lng == null) return [];
  return HOTELS.filter(
    (h) => h.id !== id && h.island === self.island && h.lat != null && h.lng != null && h.image,
  )
    .map((h) => ({
      hotel: h,
      miles: haversineMiles(self.lat as number, self.lng as number, h.lat as number, h.lng as number),
    }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, limit);
}

/** Resolve a destination to its region's hotels (city-narrowed when given). Returns [] for
 * places we haven't ingested yet (honest "we don't cover that yet"). */
export function searchHotels(query: string): Hotel[] {
  const q = query.trim().toLowerCase();
  if (!q) return HOTELS;
  if (["hawaii", "hawaiian islands", "hi", "usa", "united states"].includes(q)) return HOTELS;
  const region = resolveRegion(q);
  if (!region) return [];
  const inRegion = HOTELS.filter((h) => h.island.toLowerCase() === region.name.toLowerCase());
  const byCity = inRegion.filter((h) => h.city.toLowerCase().includes(q));
  return byCity.length ? byCity : inRegion;
}
