// LiteAPI client — hotel content + live rates (and, in the merchant phase, booking).
// Auth: X-API-Key header. Endpoint paths follow LiteAPI v3.0 — verify each against the
// current docs (https://docs.liteapi.travel) once LITEAPI_KEY is set in .env.local.
import { serverEnv, requireEnv } from "./env";

type Query = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${serverEnv.LITEAPI_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function liteApiFetch<T>(
  path: string,
  init: RequestInit & { query?: Query } = {},
): Promise<T> {
  const { query, ...rest } = init;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": requireEnv("LITEAPI_KEY"),
      ...(rest.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LiteAPI ${path} failed: ${res.status} ${res.statusText} ${body}`.trim());
  }
  return (await res.json()) as T;
}

/** Static hotel content for a location (paginated). Used by the ingest pipeline. */
export function getHotels(
  params: { countryCode?: string; cityName?: string; limit?: number; offset?: number } = {},
) {
  return liteApiFetch<unknown>("/data/hotels", { method: "GET", query: params });
}

/** Full content for a single hotel. */
export function getHotelDetails(hotelId: string) {
  return liteApiFetch<unknown>("/data/hotel", { method: "GET", query: { hotelId } });
}

/** Live rates for a set of hotels on given dates/occupancy. */
export function getRates(body: {
  hotelIds: string[];
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  occupancies: { adults: number; children?: number[] }[];
  currency?: string;
  guestNationality?: string;
}) {
  return liteApiFetch<unknown>("/hotels/rates", { method: "POST", body: JSON.stringify(body) });
}

// ── Merchant phase (parked) — live only behind BOOKING_MODE=merchant ──
// export function prebook(...) { ... }
// export function book(...) { ... }
