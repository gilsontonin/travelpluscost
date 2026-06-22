// Pure filter + sort logic for search results (testable, no React).
import type { CardHotel } from "./hotels";
import type { Price } from "./rates";
import { haversineMiles } from "./distance";
import { getRegion, anchorOf } from "./regions";

export interface Filters {
  maxPrice: number | null; // per-night ceiling
  minRating: number | null; // out of 10
  stars: number[]; // selected star levels (e.g. [4,5])
  amenities: string[]; // required amenities
  kind: "all" | "hotels" | "rentals"; // hotels & resorts vs vacation rentals
}

export const EMPTY_FILTERS: Filters = { maxPrice: null, minRating: null, stars: [], amenities: [], kind: "all" };

export type SortKey = "recommended" | "price_asc" | "price_desc" | "rating" | "distance";

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  rating: "Guest rating",
  distance: "Distance",
};

export function activeFilterCount(f: Filters): number {
  return (
    (f.maxPrice != null ? 1 : 0) +
    (f.minRating != null ? 1 : 0) +
    f.stars.length +
    f.amenities.length +
    (f.kind !== "all" ? 1 : 0)
  );
}

export function applyFilters(
  hotels: CardHotel[],
  prices: Record<string, Price> | null,
  f: Filters,
): CardHotel[] {
  return hotels.filter((h) => {
    if (f.kind === "hotels" && h.category !== "hotel") return false;
    if (f.kind === "rentals" && h.category !== "rental") return false;
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
  // "No data" (no live price / unavailable for these dates) always sinks to the bottom, in EVERY
  // sort mode — you should never scroll past unbookable hotels to reach available ones. (This also
  // fixes "price: high to low", where unpriced hotels used to float to the top via Infinity.)
  const available = (h: CardHotel) => (prices?.[h.id] != null ? 0 : 1);

  let cmp: (a: CardHotel, b: CardHotel) => number = () => 0; // "recommended" keeps the ranked order
  if (sort === "price_asc") cmp = (a, b) => perNight(a) - perNight(b);
  else if (sort === "price_desc") cmp = (a, b) => perNight(b) - perNight(a);
  else if (sort === "rating") cmp = (a, b) => (b.rating ?? 0) - (a.rating ?? 0);
  else if (sort === "distance") {
    // distance from the result set's region anchor (e.g. Waikiki Beach for Oahu)
    const region = arr[0] ? getRegion(arr[0].region) : undefined;
    const anchor = region ? anchorOf(region) : undefined;
    const dist = (h: CardHotel) =>
      anchor && h.lat != null && h.lng != null
        ? haversineMiles(h.lat, h.lng, anchor.lat, anchor.lng)
        : Number.POSITIVE_INFINITY;
    cmp = (a, b) => dist(a) - dist(b);
  }
  arr.sort((a, b) => available(a) - available(b) || cmp(a, b));
  return arr;
}
