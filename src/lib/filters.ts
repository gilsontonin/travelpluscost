// Pure filter + sort logic for search results (testable, no React).
import type { CardHotel } from "./oahu";
import type { Price } from "./rates";

export interface Filters {
  maxPrice: number | null; // per-night ceiling
  minRating: number | null; // out of 10
  stars: number[]; // selected star levels (e.g. [4,5])
  amenities: string[]; // required amenities
}

export const EMPTY_FILTERS: Filters = { maxPrice: null, minRating: null, stars: [], amenities: [] };

export type SortKey = "recommended" | "price_asc" | "price_desc" | "rating";

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  rating: "Guest rating",
};

export function activeFilterCount(f: Filters): number {
  return (f.maxPrice != null ? 1 : 0) + (f.minRating != null ? 1 : 0) + f.stars.length + f.amenities.length;
}

export function applyFilters(
  hotels: CardHotel[],
  prices: Record<string, Price> | null,
  f: Filters,
): CardHotel[] {
  return hotels.filter((h) => {
    if (f.minRating != null && (h.rating ?? 0) < f.minRating) return false;
    if (f.stars.length && !(h.stars != null && f.stars.includes(h.stars))) return false;
    if (f.amenities.length && !f.amenities.every((a) => h.amenities.includes(a))) return false;
    if (f.maxPrice != null) {
      const p = prices?.[h.id];
      if (!p || p.perNight > f.maxPrice) return false;
    }
    return true;
  });
}

export function applySort(
  hotels: CardHotel[],
  prices: Record<string, Price> | null,
  sort: SortKey,
): CardHotel[] {
  const arr = [...hotels];
  const perNight = (h: CardHotel) => prices?.[h.id]?.perNight ?? Number.POSITIVE_INFINITY;
  if (sort === "price_asc") arr.sort((a, b) => perNight(a) - perNight(b));
  else if (sort === "price_desc") arr.sort((a, b) => perNight(b) - perNight(a));
  else if (sort === "rating") arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  // "recommended" keeps the ingested order
  return arr;
}
