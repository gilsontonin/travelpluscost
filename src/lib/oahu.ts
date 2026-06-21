// Local hotel CONTENT store (ingested from LiteAPI -> content/oahu.json).
// Served instantly (no live API call for content). Scales: ingest more -> bigger JSON / a DB.
import oahuData from "../../content/oahu.json";

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
  lat: number | null;
  lng: number | null;
  checkin: string | null;
  checkout: string | null;
}

// Lightweight shape for result cards (keeps the search payload small — only what HotelRow renders).
export type CardHotel = Pick<
  OahuHotel,
  "id" | "name" | "city" | "address" | "image" | "stars" | "rating" | "reviewCount"
> & { images: string[] };

export function toCard(h: OahuHotel): CardHotel {
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    address: h.address,
    image: h.image,
    images: h.images.slice(0, 3),
    stars: h.stars,
    rating: h.rating,
    reviewCount: h.reviewCount,
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
