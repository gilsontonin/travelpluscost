// "About the neighborhood" data: nearby places from OpenStreetMap (Overpass) + real drive times
// from OSRM. On-demand + cached (30d; POIs barely change). Degrades to nothing if the free public
// endpoints are unavailable — the page still shows the map + address. No faked walk/drive times.

export interface Place {
  name: string;
  lat: number;
  lng: number;
  distMi: number;
  driveMin?: number;
  icon: "sight" | "food" | "transit" | "air";
}
export interface Neighborhood {
  nearby: Place[];
  restaurants: Place[];
  gettingAround: Place[];
}

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
// OSM's public services require a meaningful User-Agent or they return 406/429.
const UA = "travelpluscost/1.0 (+https://travelpluscost.com)";

const cache = new Map<string, { at: number; data: Neighborhood }>();
const TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

function haversineMi(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

type RawEl = { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

async function overpass(lat: number, lng: number): Promise<RawEl[]> {
  // Kept lean on purpose — the public Overpass instance is slow, and wide-radius scans (airports)
  // blow the timeout. Nearby attractions + restaurants + close transit are the high-value core.
  const q = `[out:json][timeout:25];(
    nwr(around:1500,${lat},${lng})[tourism~"^(attraction|museum|aquarium|zoo|theme_park|viewpoint)$"][name];
    nwr(around:1500,${lat},${lng})[leisure~"^(park|golf_course|beach_resort|marina|water_park)$"][name];
    nwr(around:1500,${lat},${lng})[natural=beach][name];
    nwr(around:2500,${lat},${lng})[amenity~"^(restaurant|cafe|fast_food|bar)$"][name];
    nwr(around:4000,${lat},${lng})[railway=station][name];
  );out center tags 50;`;
  // Race the mirrors in PARALLEL (sequential is too slow — public Overpass can take 10s+ each) and
  // take the first that returns data. Fast-fail to [] so the page degrades to map + address.
  const attempt = async (host: string): Promise<RawEl[]> => {
    const r = await fetch(host, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: `data=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    if (!Array.isArray(j.elements) || !j.elements.length) throw new Error("empty");
    return j.elements as RawEl[];
  };
  try {
    return await Promise.any(OVERPASS_MIRRORS.map(attempt));
  } catch {
    return [];
  }
}

async function osrmDrive(
  origin: [number, number],
  dests: [number, number][],
): Promise<{ dur: number[]; dist: number[] } | null> {
  if (!dests.length) return null;
  const coords = [origin, ...dests].map(([lng, lat]) => `${lng},${lat}`).join(";");
  try {
    const r = await fetch(
      `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=duration,distance`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) },
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (j.code !== "Ok") return null;
    return { dur: (j.durations?.[0] ?? []).slice(1), dist: (j.distances?.[0] ?? []).slice(1) };
  } catch {
    return null;
  }
}

function iconFor(t: Record<string, string>): Place["icon"] {
  if (t.aeroway) return "air";
  if (t.railway || t.public_transport) return "transit";
  if (t.amenity) return "food";
  return "sight";
}
function categoryOf(t: Record<string, string>): keyof Neighborhood {
  if (t.amenity && /restaurant|cafe|fast_food|bar/.test(t.amenity)) return "restaurants";
  if (t.railway || t.public_transport || t.aeroway) return "gettingAround";
  return "nearby";
}

export async function getNeighborhood(lat: number, lng: number): Promise<Neighborhood> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  const els = await overpass(lat, lng);
  const buckets: Neighborhood = { nearby: [], restaurants: [], gettingAround: [] };
  const seen = new Set<string>();
  for (const e of els) {
    const t = e.tags || {};
    const name = (t.name || "").trim();
    const plat = e.lat ?? e.center?.lat;
    const plng = e.lon ?? e.center?.lon;
    if (!name || plat == null || plng == null) continue;
    const cat = categoryOf(t);
    const dkey = `${cat}:${name.toLowerCase()}`;
    if (seen.has(dkey)) continue; // dedupe duplicate names per category
    seen.add(dkey);
    buckets[cat].push({ name, lat: plat, lng: plng, distMi: haversineMi(lat, lng, plat, plng), icon: iconFor(t) });
  }
  const take = (arr: Place[], n: number) => arr.sort((a, b) => a.distMi - b.distMi).slice(0, n);
  const data: Neighborhood = {
    nearby: take(buckets.nearby, 6),
    restaurants: take(buckets.restaurants, 5),
    gettingAround: take(buckets.gettingAround, 4),
  };

  // Real drive times for restaurants + getting-around (Expedia shows these as drive times).
  const driveSet = [...data.restaurants, ...data.gettingAround];
  const osrm = await osrmDrive([lng, lat], driveSet.map((p) => [p.lng, p.lat] as [number, number]));
  if (osrm) {
    driveSet.forEach((p, i) => {
      if (isFinite(osrm.dur[i])) p.driveMin = Math.max(1, Math.round(osrm.dur[i] / 60));
      if (isFinite(osrm.dist[i])) p.distMi = osrm.dist[i] / 1609.34;
    });
  }

  // Only cache real results — never poison the cache with a transient Overpass failure.
  if (data.nearby.length + data.restaurants.length + data.gettingAround.length > 0) {
    cache.set(key, { at: Date.now(), data });
  }
  return data;
}
