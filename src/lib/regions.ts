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

export const REGIONS: Region[] = [OAHU];

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
