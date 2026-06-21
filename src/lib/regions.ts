import type { Landmark } from "./distance";

// A market we cover. Adding one = ingest its data → content/<slug>.json, then add a
// Region entry here (terms + center + landmarks). Everything else (search, map, rails,
// distances, FAQ) is driven off this — no other code changes needed.
export interface Region {
  slug: string; // file/key, e.g. "oahu"
  name: string; // must match hotel.island in the data, e.g. "Oahu"
  label: string; // display, e.g. "Oahu, Hawaii"
  terms: string[]; // search terms that resolve to this region
  cities: string[]; // used by the ingest script
  center: [number, number]; // default map center
  anchor: string; // landmark name used for the "Near X" rail + distance sort
  landmarks: Landmark[]; // for "X mi from Y", "What's nearby", distance sort
}

export const OAHU: Region = {
  slug: "oahu",
  name: "Oahu",
  label: "Oahu, Hawaii",
  terms: ["oahu", "honolulu", "waikiki", "kapolei", "kailua", "ko olina", "koolina"],
  cities: ["Honolulu", "Kapolei", "Kailua"],
  center: [21.34, -157.9],
  anchor: "Waikiki Beach",
  landmarks: [
    { name: "Waikiki Beach", lat: 21.2766, lng: -157.8266 },
    { name: "Honolulu airport (HNL)", lat: 21.3187, lng: -157.9225, airport: true },
    { name: "Diamond Head", lat: 21.262, lng: -157.8055 },
    { name: "Ala Moana Center", lat: 21.2914, lng: -157.8434 },
    { name: "Ala Moana Beach Park", lat: 21.2896, lng: -157.8463 },
    { name: "Pearl Harbor", lat: 21.3669, lng: -157.9389 },
    { name: "Hanauma Bay", lat: 21.269, lng: -157.6939 },
    { name: "Kailua Beach", lat: 21.3926, lng: -157.7397 },
    { name: "Lanikai Beach", lat: 21.3927, lng: -157.7152 },
    { name: "Ko Olina Lagoons", lat: 21.337, lng: -158.1227 },
    { name: "Downtown Honolulu", lat: 21.307, lng: -157.8576 },
    { name: "Kapolei", lat: 21.3357, lng: -158.0581 },
    { name: "Haleiwa (North Shore)", lat: 21.5928, lng: -158.1036 },
  ],
};

export const MAUI: Region = {
  slug: "maui",
  name: "Maui",
  label: "Maui, Hawaii",
  terms: ["maui", "lahaina", "kihei", "wailea", "kaanapali", "kahului", "hana"],
  cities: ["Lahaina", "Kihei", "Wailea"],
  center: [20.8, -156.47],
  anchor: "Wailea Beach",
  landmarks: [
    { name: "Wailea Beach", lat: 20.685, lng: -156.4419 },
    { name: "Kahului airport (OGG)", lat: 20.8986, lng: -156.4305, airport: true },
    { name: "Kaanapali Beach", lat: 20.9279, lng: -156.6947 },
    { name: "Lahaina", lat: 20.8783, lng: -156.6825 },
    { name: "Big Beach (Makena)", lat: 20.632, lng: -156.447 },
    { name: "Haleakala", lat: 20.7097, lng: -156.2533 },
    { name: "Hana", lat: 20.758, lng: -155.9905 },
  ],
};

export const LAS_VEGAS: Region = {
  slug: "lasvegas",
  name: "Las Vegas",
  label: "Las Vegas, Nevada",
  terms: ["las vegas", "vegas", "paradise", "nevada"],
  cities: ["Las Vegas"],
  center: [36.12, -115.17],
  anchor: "The Strip",
  landmarks: [
    { name: "The Strip", lat: 36.1147, lng: -115.1728 },
    { name: "Harry Reid airport (LAS)", lat: 36.084, lng: -115.1537, airport: true },
    { name: "Bellagio Fountains", lat: 36.1126, lng: -115.1767 },
    { name: "Fremont Street", lat: 36.1699, lng: -115.1398 },
    { name: "Allegiant Stadium", lat: 36.0909, lng: -115.183 },
    { name: "Convention Center", lat: 36.1316, lng: -115.151 },
    { name: "Red Rock Canyon", lat: 36.1357, lng: -115.4275 },
  ],
};

export const SEATTLE: Region = {
  slug: "seattle",
  name: "Seattle",
  label: "Seattle, Washington",
  terms: ["seattle", "washington", "bellevue"],
  cities: ["Seattle"],
  center: [47.61, -122.33],
  anchor: "Pike Place Market",
  landmarks: [
    { name: "Pike Place Market", lat: 47.6097, lng: -122.3422 },
    { name: "Sea-Tac airport (SEA)", lat: 47.4502, lng: -122.3088, airport: true },
    { name: "Space Needle", lat: 47.6205, lng: -122.3493 },
    { name: "Pioneer Square", lat: 47.6015, lng: -122.3343 },
    { name: "Downtown Seattle", lat: 47.6062, lng: -122.3321 },
    { name: "Lumen Field", lat: 47.5952, lng: -122.3316 },
  ],
};

export const SAN_DIEGO: Region = {
  slug: "sandiego",
  name: "San Diego",
  label: "San Diego, California",
  terms: ["san diego", "california", "gaslamp", "la jolla", "coronado"],
  cities: ["San Diego"],
  center: [32.72, -117.16],
  anchor: "Gaslamp Quarter",
  landmarks: [
    { name: "Gaslamp Quarter", lat: 32.7117, lng: -117.1597 },
    { name: "San Diego airport (SAN)", lat: 32.7338, lng: -117.1933, airport: true },
    { name: "Balboa Park", lat: 32.7341, lng: -117.1446 },
    { name: "San Diego Zoo", lat: 32.7353, lng: -117.149 },
    { name: "Mission Beach", lat: 32.7706, lng: -117.252 },
    { name: "Coronado Beach", lat: 32.6859, lng: -117.1831 },
    { name: "Petco Park", lat: 32.7073, lng: -117.1566 },
    { name: "La Jolla Cove", lat: 32.8508, lng: -117.2713 },
  ],
};

export const REGIONS: Region[] = [OAHU, MAUI, LAS_VEGAS, SEATTLE, SAN_DIEGO];

export const PRIMARY_REGION = REGIONS[0];

export function getRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export function regionForIsland(island: string | null | undefined): Region {
  const n = (island ?? "").toLowerCase();
  return REGIONS.find((r) => r.name.toLowerCase() === n) ?? PRIMARY_REGION;
}

/** Resolve a free-text destination to a region (by its terms). */
export function resolveRegion(destination: string): Region | undefined {
  const q = destination.trim().toLowerCase();
  if (!q) return undefined;
  return REGIONS.find((r) => r.terms.some((t) => q.includes(t) || t.includes(q)));
}

export function anchorOf(region: Region): Landmark | undefined {
  return region.landmarks.find((l) => l.name === region.anchor);
}
