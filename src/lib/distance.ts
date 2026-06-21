// Pure straight-line distance helpers (haversine). Landmarks are supplied per region
// (see regions.ts) — this file stays location-agnostic. We always label "X mi from Y"
// (straight-line), never a faked "N min walk".

export interface Landmark {
  name: string;
  lat: number;
  lng: number;
  airport?: boolean; // surfaced in "What's nearby" regardless of distance rank
}

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

export function nearestLandmark(
  lat: number | null | undefined,
  lng: number | null | undefined,
  landmarks: Landmark[],
): { name: string; miles: number } | null {
  if (lat == null || lng == null || !landmarks.length) return null;
  let best: Landmark | null = null;
  let bestD = Infinity;
  for (const l of landmarks) {
    const d = haversineMiles(lat, lng, l.lat, l.lng);
    if (d < bestD) {
      bestD = d;
      best = l;
    }
  }
  return best ? { name: best.name, miles: bestD } : null;
}

/** "0.3 mi from Waikiki Beach" — the card/header line. */
export function nearbyLabel(
  lat: number | null | undefined,
  lng: number | null | undefined,
  landmarks: Landmark[],
): string | null {
  const n = nearestLandmark(lat, lng, landmarks);
  return n ? `${fmtMiles(n.miles)} from ${n.name}` : null;
}

/** Closest N landmarks (always includes the region's airport) — property "What's nearby". */
export function nearbyList(
  lat: number | null | undefined,
  lng: number | null | undefined,
  landmarks: Landmark[],
  n = 5,
): { name: string; miles: number }[] {
  if (lat == null || lng == null || !landmarks.length) return [];
  const all = landmarks
    .map((l) => ({ name: l.name, miles: haversineMiles(lat, lng, l.lat, l.lng), airport: l.airport }))
    .sort((a, b) => a.miles - b.miles);
  const top = all.slice(0, n);
  const air = all.find((x) => x.airport);
  if (air && !top.some((x) => x.airport)) top.push(air);
  return top.map(({ name, miles }) => ({ name, miles }));
}
