import { supabaseAdmin } from "./supabase";
import type { Price } from "./rates";

// OUR OWN price-history index — the free, on-brand alternative to LiteAPI's paid Price Index ($0.05/req).
// We already fetch live rates for the result cards; here we log one observation per hotel per day (the
// per-night SSP) into `rate_log`. Over weeks this accumulates into a real distribution, so we can honestly
// say "usually $X/night here — today's a good deal" using data we collected ourselves (no markup games,
// no vendor black box). The PK (hotel_id, captured_date) dedupes to one row/hotel/day.
//
// PREREQUISITE (run once in the Supabase SQL editor — this code cannot run DDL):
//   create table if not exists public.rate_log (
//     hotel_id text not null,
//     captured_date date not null default current_date,
//     ssp numeric not null,
//     primary key (hotel_id, captured_date)
//   );
//   create index if not exists rate_log_hotel_idx on public.rate_log (hotel_id, captured_date desc);

/** Best-effort: append today's per-night SSP for each priced hotel. Never throws (pricing must not break). */
export async function logRates(prices: Record<string, Price>): Promise<void> {
  const rows = Object.entries(prices)
    .filter(([, p]) => typeof p?.perNight === "number" && p.perNight > 0)
    .map(([hotel_id, p]) => ({ hotel_id, ssp: Math.round(p.perNight) })); // captured_date defaults to today
  if (!rows.length) return;
  try {
    // insert-or-ignore: the first observation of the day wins; repeats today are no-ops (cheap).
    await supabaseAdmin().from("rate_log").upsert(rows, { onConflict: "hotel_id,captured_date", ignoreDuplicates: true });
  } catch {
    /* logging is best-effort — a failure here must never affect the price response */
  }
}

export interface PriceBand {
  n: number; // observations behind the band
  low: number; // 25th percentile per-night
  median: number;
  high: number; // 75th percentile per-night
}

/**
 * "Typical" nightly band for a hotel from the last 90 days of our own observations.
 * Returns null until there's real signal (≥5 nights) so the UI shows nothing rather than a noisy guess —
 * which is exactly why this feature is dormant until the log accumulates over the coming weeks.
 */
export async function hotelPriceBand(hotelId: string): Promise<PriceBand | null> {
  const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin()
    .from("rate_log")
    .select("ssp")
    .eq("hotel_id", hotelId)
    .gte("captured_date", since);
  if (error) return null;
  const xs = (data ?? []).map((r) => Number(r.ssp)).filter((n) => n > 0).sort((a, b) => a - b);
  if (xs.length < 5) return null;
  const q = (p: number) => xs[Math.min(xs.length - 1, Math.floor(p * xs.length))];
  return { n: xs.length, low: q(0.25), median: q(0.5), high: q(0.75) };
}
