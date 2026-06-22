// Hotel DIRECTORY queries — reads the Supabase `hotels` table (the thin index of every property).
// This is the search + SEO layer that scales to every hotel in the US, then the world. Full content
// and live rates still come from LiteAPI on demand (the directory holds no prices). Server-only.
import { supabaseAdmin } from "./supabase";
import { resolveRegion } from "./regions";
import type { CardHotel } from "./hotels";

export interface DirectoryHotel {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  state: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  stars: number | null;
  rating: number | null;
  review_count: number | null;
  thumbnail: string | null;
  kind: string | null; // 'hotel' | 'rental'
  property_type: string | null; // 'Hotel','Resort','Villa',…
}

const COLS = "id,name,slug,city,state,country,lat,lng,stars,rating,review_count,thumbnail,kind,property_type";

// Lead with hotels (kind 'hotel' sorts before 'rental'), then best-rated first.
// Lead with hotels (kind 'hotel' sorts before 'rental'), then best-rated first.
const ORDER_KIND = { ascending: true, nullsFirst: false } as const;
const ORDER_RATING = { ascending: false, nullsFirst: false } as const;

/** Hotels in a named city — powers "hotels in <city>" pages and city search. */
export async function hotelsByCity(city: string, country = "us", limit = 60): Promise<DirectoryHotel[]> {
  const { data, error } = await supabaseAdmin()
    .from("hotels")
    .select(COLS)
    .eq("country", country.toLowerCase())
    .ilike("city", city)
    .order("kind", ORDER_KIND)
    .order("rating", ORDER_RATING)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DirectoryHotel[];
}

/** Fuzzy name/city match — typeahead + free-text search. */
export async function searchHotelsByText(q: string, limit = 25): Promise<DirectoryHotel[]> {
  const term = q.trim().replace(/[%,()]/g, " ");
  if (!term) return [];
  const { data, error } = await supabaseAdmin()
    .from("hotels")
    .select(COLS)
    .or(`name.ilike.%${term}%,city.ilike.%${term}%`)
    .order("kind", ORDER_KIND)
    .order("rating", ORDER_RATING)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DirectoryHotel[];
}

/** Bounding-box radius search (fast, index-friendly) — map view + "near a landmark". */
export async function hotelsNear(lat: number, lng: number, radiusKm = 15, limit = 60): Promise<DirectoryHotel[]> {
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180) || 1);
  const { data, error } = await supabaseAdmin()
    .from("hotels")
    .select(COLS)
    .gte("lat", lat - dLat)
    .lte("lat", lat + dLat)
    .gte("lng", lng - dLng)
    .lte("lng", lng + dLng)
    .order("kind", ORDER_KIND)
    .order("rating", ORDER_RATING)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DirectoryHotel[];
}

/** One hotel by id (for the property page's directory shell before live content loads). */
export async function getDirectoryHotel(id: string): Promise<DirectoryHotel | null> {
  const { data, error } = await supabaseAdmin().from("hotels").select(COLS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DirectoryHotel) ?? null;
}

/** Directory row → the CardHotel shape the search results pipeline already renders. */
export function directoryToCard(h: DirectoryHotel): CardHotel {
  return {
    id: h.id,
    name: h.name,
    city: h.city ?? "",
    address: "",
    image: h.thumbnail ?? "",
    images: h.thumbnail ? [h.thumbnail] : [],
    stars: h.stars,
    rating: h.rating,
    reviewCount: h.review_count,
    amenities: [], // directory holds no amenity data (fetched live on the property page)
    lat: h.lat,
    lng: h.lng,
    nearby: null,
    propertyType: h.property_type ?? "",
    category: h.kind === "rental" ? "rental" : "hotel",
    region: "",
  };
}

/** Resolve a free-text destination to result cards from the directory. City first; an island/market
 * name (e.g. "Oahu") expands to its cities; otherwise a fuzzy name/city match. Covers any US city. */
export async function searchDirectory(destination: string, limit = 80): Promise<CardHotel[]> {
  const city = destination.split(",")[0].trim();
  let rows: DirectoryHotel[] = city ? await hotelsByCity(city, "us", limit) : [];
  if (!rows.length) {
    const region = resolveRegion(destination);
    if (region) {
      const lists = await Promise.all(region.cities.map((c) => hotelsByCity(c, "us", limit)));
      const seen = new Set<string>();
      rows = lists.flat().filter((h) => (seen.has(h.id) ? false : seen.add(h.id)));
    }
  }
  if (!rows.length) rows = await searchHotelsByText(destination, limit);
  return rows.map(directoryToCard);
}

/** Total directory size — for status/health. */
export async function directoryCount(country?: string): Promise<number> {
  let q = supabaseAdmin().from("hotels").select("id", { count: "exact", head: true });
  if (country) q = q.eq("country", country.toLowerCase());
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}
