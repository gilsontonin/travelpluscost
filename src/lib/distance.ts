// Real distances from a hotel's lat/lng to known Oahu landmarks (haversine, straight-line).
// Honest: we label it "X mi from Y" (straight-line), never a faked "N min walk".

export interface Landmark {
  name: string;
  lat: number;
  lng: number;
}

export const OAHU_LANDMARKS: Landmark[] = [
  { name: "Waikiki Beach", lat: 21.2766, lng: -157.8266 },
  { name: "Honolulu airport (HNL)", lat: 21.3187, lng: -157.9225 },
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
];

const EARTH_MI = 3958.8;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function fmtMiles(mi: number): string {
  return `${mi >= 10 ? Math.round(mi) : mi.toFixed(1)} mi`;
}

export function nearestLandmark(lat?: number | null, lng?: number | null): { name: string; miles: number } | null {
  if (lat == null || lng == null) return null;
  let best: Landmark | null = null;
  let bestD = Infinity;
  for (const l of OAHU_LANDMARKS) {
    const d = haversineMiles(lat, lng, l.lat, l.lng);
    if (d < bestD) {
      bestD = d;
      best = l;
    }
  }
  return best ? { name: best.name, miles: bestD } : null;
}

/** "0.3 mi from Waikiki Beach" — the card/header line. */
export function nearbyLabel(lat?: number | null, lng?: number | null): string | null {
  const n = nearestLandmark(lat, lng);
  return n ? `${fmtMiles(n.miles)} from ${n.name}` : null;
}

/** Closest N landmarks (always includes the airport) — the property "What's nearby" list. */
export function nearbyList(lat?: number | null, lng?: number | null, n = 5): { name: string; miles: number }[] {
  if (lat == null || lng == null) return [];
  const all = OAHU_LANDMARKS.map((l) => ({ name: l.name, miles: haversineMiles(lat, lng, l.lat, l.lng) })).sort(
    (a, b) => a.miles - b.miles,
  );
  const top = all.slice(0, n);
  const air = all.find((x) => x.name.includes("HNL"));
  if (air && !top.some((x) => x.name.includes("HNL"))) top.push(air);
  return top;
}
