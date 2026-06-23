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
// Candidate fetch order: most-reviewed first (surfaces established places into the result set);
// final ranking is the review-weighted score below, applied in JS.
const ORDER_REVIEWS = { ascending: false, nullsFirst: false } as const;

// Review-weighted (Bayesian) rating: weighted = (v·R + M·C)/(v+M). A 1-review perfect 10 gets
// pulled toward the prior mean C, so it can't outrank a well-reviewed favourite. M = prior weight.
function weightedRating(h: DirectoryHotel): number {
  const v = h.review_count ?? 0;
  const R = h.rating ?? 0;
  const M = 25;
  const C = 8;
  return (v * R + M * C) / (v + M);
}

/** Final ranking for results: hotels before rentals, then review-weighted rating. */
export function rankHotels(rows: DirectoryHotel[]): DirectoryHotel[] {
  return [...rows].sort((a, b) => {
    const ka = a.kind === "rental" ? 1 : 0;
    const kb = b.kind === "rental" ? 1 : 0;
    if (ka !== kb) return ka - kb;
    return weightedRating(b) - weightedRating(a);
  });
}

/** Hotels in a named city — powers "hotels in <city>" pages and city search. */
export async function hotelsByCity(city: string, country = "us", limit = 60, state?: string): Promise<DirectoryHotel[]> {
  let q = supabaseAdmin()
    .from("hotels")
    .select(COLS)
    .eq("country", country.toLowerCase())
    .ilike("city", city)
    .eq("kind", "hotel"); // real hotels only — rentals/B&Bs/etc. are hidden from search
  if (state) q = q.eq("state", state.toUpperCase()); // disambiguate same-named cities (Austin TX vs MN)
  const { data, error } = await q.order("review_count", ORDER_REVIEWS).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DirectoryHotel[];
}

/** Count of real hotels in a named city — the "{n} hotels in {city}" line on the city hub. */
export async function cityHotelCount(city: string, country = "us", state?: string): Promise<number> {
  let q = supabaseAdmin()
    .from("hotels")
    .select("id", { count: "exact", head: true })
    .eq("country", country.toLowerCase())
    .ilike("city", city)
    .eq("kind", "hotel");
  if (state) q = q.eq("state", state.toUpperCase());
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Fuzzy name/city match — typeahead + free-text search. */
export async function searchHotelsByText(q: string, limit = 25): Promise<DirectoryHotel[]> {
  const term = q.trim().replace(/[%,()]/g, " ");
  if (!term) return [];
  const { data, error } = await supabaseAdmin()
    .from("hotels")
    .select(COLS)
    .or(`name.ilike.%${term}%,city.ilike.%${term}%`)
    .eq("kind", "hotel")
    .order("review_count", ORDER_REVIEWS)
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
    .eq("kind", "hotel")
    .order("review_count", ORDER_REVIEWS)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DirectoryHotel[];
}

/** Top hotels across a set of US states — powers the seasonal home collection. */
export async function hotelsByStates(states: string[], limit = 60): Promise<DirectoryHotel[]> {
  if (!states.length) return [];
  const { data, error } = await supabaseAdmin()
    .from("hotels")
    .select(COLS)
    .eq("country", "us")
    .in("state", states.map((s) => s.toUpperCase()))
    .eq("kind", "hotel")
    .not("thumbnail", "is", null) // rails need a photo
    .order("review_count", ORDER_REVIEWS)
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
export async function searchDirectory(destination: string, limit = 500): Promise<CardHotel[]> {
  const CAND = Math.max(limit + 100, 600); // fetch a generous candidate set, then weight-rank down to `limit`
  // "Austin, TX" -> city "Austin" + state "TX" (a trailing 2-letter token); "Austin" -> no state filter.
  const parts = destination.split(",").map((s) => s.trim()).filter(Boolean);
  const city = parts[0] ?? "";
  const state = parts[1] && /^[A-Za-z]{2}$/.test(parts[1]) ? parts[1].toUpperCase() : undefined;
  let rows: DirectoryHotel[] = city ? await hotelsByCity(city, "us", CAND, state) : [];
  if (!rows.length && state) rows = await hotelsByCity(city, "us", CAND); // state had no match -> try city-only
  if (!rows.length) {
    const region = resolveRegion(destination);
    if (region) {
      const lists = await Promise.all(region.cities.map((c) => hotelsByCity(c, "us", CAND)));
      const seen = new Set<string>();
      rows = lists.flat().filter((h) => (seen.has(h.id) ? false : seen.add(h.id)));
    }
  }
  if (!rows.length) rows = await searchHotelsByText(destination, CAND);
  return rankHotels(rows).slice(0, limit).map(directoryToCard);
}

/** Total directory size — for status/health. */
export async function directoryCount(country?: string): Promise<number> {
  let q = supabaseAdmin().from("hotels").select("id", { count: "exact", head: true });
  if (country) q = q.eq("country", country.toLowerCase());
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// Stable, paginated id pull for the sharded hotel sitemap. PostgREST caps reads at 1,000 rows, so
// we fan out fixed-offset range() queries (bounded concurrency) and concatenate. Ordered by id so
// pagination is deterministic and shards never overlap or drop rows.
export interface SitemapHotel {
  id: string;
  name: string;
  city: string;
}
export async function directoryIdsRange(offset: number, count: number, country = "us"): Promise<SitemapHotel[]> {
  const sb = supabaseAdmin();
  const PAGE = 1000;
  const CONC = 25;
  const pages = Math.ceil(count / PAGE);
  const out: SitemapHotel[] = [];
  for (let b = 0; b < pages; b += CONC) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(CONC, pages - b) }, (_, i) => {
        const from = offset + (b + i) * PAGE;
        return sb
          .from("hotels")
          .select("id,name,city")
          .eq("country", country.toLowerCase())
          .order("id", { ascending: true })
          .range(from, from + PAGE - 1)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message);
            return (data ?? []).map((r) => ({ id: r.id as string, name: (r.name as string) ?? "", city: (r.city as string) ?? "" }));
          });
      }),
    );
    for (const part of batch) out.push(...part);
  }
  return out;
}
