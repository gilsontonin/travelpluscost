// Typed reader for content/geo-index.json (built by scripts/gen-sitemaps.mjs from the directory).
// Powers the /hotels browse index, state hubs (/destinations/<state>) and city-hub cross-links —
// all without a runtime DB call. Each city slug is filed under one primary state (see the generator).
import geoData from "../../content/geo-index.json";
import { stateName, stateSlugFromCode, stateCodeFromSlug } from "./states";

export interface GeoCity {
  slug: string;
  name: string;
  count: number;
}
interface GeoState {
  hotels: number;
  cities: GeoCity[];
}
interface GeoIndex {
  generated: string;
  totals: { hotels: number; cities: number; states: number };
  states: Record<string, GeoState>;
}

const GEO = geoData as GeoIndex;

export interface StateSummary {
  code: string;
  name: string;
  slug: string;
  hotels: number;
  cityCount: number;
  topCities: GeoCity[]; // most hotels first — for index/state-hub quick links
}

export function geoTotals() {
  return GEO.totals;
}

function summary(code: string, s: GeoState): StateSummary {
  return {
    code,
    name: stateName(code) ?? code,
    slug: stateSlugFromCode(code) ?? code.toLowerCase(),
    hotels: s.hotels,
    cityCount: s.cities.length,
    topCities: s.cities.slice(0, 6),
  };
}

/** All states with hotels, most hotels first — for the /hotels browse index. */
export function statesSorted(): StateSummary[] {
  return Object.entries(GEO.states)
    .filter(([, s]) => s.hotels > 0)
    .map(([code, s]) => summary(code, s))
    .sort((a, b) => b.hotels - a.hotels || a.name.localeCompare(b.name));
}

/** One state hub by url slug (e.g. "texas") with all its cities. */
export function stateBySlug(slug: string): (StateSummary & { cities: GeoCity[] }) | null {
  const code = stateCodeFromSlug(slug);
  if (!code) return null;
  const s = GEO.states[code];
  if (!s) return null;
  return { ...summary(code, s), cities: s.cities };
}

export function allStateSlugs(): string[] {
  return statesSorted().map((s) => s.slug);
}

// city slug -> primary state code, built once.
let _cityState: Map<string, string> | null = null;
function cityStateMap(): Map<string, string> {
  if (!_cityState) {
    _cityState = new Map();
    for (const [code, s] of Object.entries(GEO.states)) {
      for (const c of s.cities) if (!_cityState.has(c.slug)) _cityState.set(c.slug, code);
    }
  }
  return _cityState;
}

/** A city's home state + its sibling cities in that state — for same-state cross-links on a city hub. */
export function siblingCities(citySlug: string, limit = 12): { state: StateSummary; cities: GeoCity[] } | null {
  const code = cityStateMap().get(citySlug);
  if (!code) return null;
  const s = GEO.states[code];
  if (!s) return null;
  return { state: summary(code, s), cities: s.cities.filter((c) => c.slug !== citySlug).slice(0, limit) };
}

// Highest-inventory cities nationwide — for the "Popular destinations" interlink cluster.
let _popular: GeoCity[] | null = null;
export function popularCities(limit = 24): GeoCity[] {
  if (!_popular) {
    const all: GeoCity[] = [];
    for (const s of Object.values(GEO.states)) all.push(...s.cities);
    _popular = all.sort((a, b) => b.count - a.count);
  }
  return _popular.slice(0, limit);
}
