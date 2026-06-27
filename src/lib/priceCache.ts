"use client";

// Client-side browse-price cache. Keeps room/"from" prices visible across back/forward navigation for a
// few hours, so re-visiting a page doesn't fire a fresh (slow, multi-second) LiteAPI fetch. Browse prices
// only — the real charge is ALWAYS re-verified at /book (prebook), so a slightly stale browse price is
// harmless. localStorage so it survives reloads + new tabs within the window. Best-effort (any error =
// fall through to a live fetch).
const TTL_MS = 3 * 60 * 60 * 1000; // 3 hours
const PREFIX = "tpc-price:";

export function getCachedPrice<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: T };
    if (Date.now() - ts > TTL_MS) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCachedPrice<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // quota exceeded / storage disabled — ignore (cache is best-effort)
  }
}
