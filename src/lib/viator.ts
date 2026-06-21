// Viator "things to do" provider — STUB for now (returns curated sample activities by island).
// Swap getActivitiesNear() for the real Viator API later; the card shape stays the same so the UI
// doesn't change. (We already have a Viator inventory format from the Hawaii project to reuse.)
export interface Activity {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  durationHours: number;
  price: number; // supplier cost; cost-plus fee applied at display when we go live
  currency: string;
}

const OAHU_ACTIVITIES: Activity[] = [
  { id: "v-pearl", title: "Pearl Harbor & USS Arizona Memorial Tour", category: "History", rating: 4.8, reviews: 5210, durationHours: 6, price: 79, currency: "USD" },
  { id: "v-diamond", title: "Diamond Head Sunrise Hike + Breakfast", category: "Outdoors", rating: 4.7, reviews: 1840, durationHours: 4, price: 65, currency: "USD" },
  { id: "v-luau", title: "Oahu Luau with Dinner & Fire Show", category: "Culture", rating: 4.6, reviews: 3120, durationHours: 5, price: 139, currency: "USD" },
  { id: "v-hanauma", title: "Hanauma Bay Snorkel Adventure", category: "Water", rating: 4.5, reviews: 2270, durationHours: 4, price: 55, currency: "USD" },
  { id: "v-northshore", title: "North Shore & Circle Island Day Tour", category: "Sightseeing", rating: 4.7, reviews: 1990, durationHours: 8, price: 99, currency: "USD" },
  { id: "v-catamaran", title: "Waikiki Sunset Catamaran Sail", category: "Water", rating: 4.8, reviews: 2640, durationHours: 2, price: 49, currency: "USD" },
];

export function getActivitiesNear(_lat?: number | null, _lng?: number | null, limit = 6): Activity[] {
  return OAHU_ACTIVITIES.slice(0, limit);
}
