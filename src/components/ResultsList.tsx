"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HotelRow from "./HotelRow";
import MapResults from "@/components/MapResults";
import FilterChip from "@/components/FilterChip";
import { ALL_AMENITIES } from "@/lib/oahu";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
  applySort,
  SORT_LABELS,
} from "@/lib/filters";
import type { Filters, SortKey } from "@/lib/filters";

const RATING_OPTIONS = [
  { v: 9, label: "Exceptional 9+" },
  { v: 8, label: "Very good 8+" },
  { v: 7, label: "Good 7+" },
];
const STAR_OPTIONS = [5, 4, 3];

function chip(active: boolean) {
  return `text-sm px-3 py-1.5 rounded-lg border transition ${
    active ? "bg-accent-tint text-accent border-accent/40" : "border-black/15 text-black/70 hover:border-black/40"
  }`;
}

export default function ResultsList({
  hotels,
  checkin,
  checkout,
  adults,
}: {
  hotels: CardHotel[];
  checkin?: string;
  checkout?: string;
  adults: number;
}) {
  const [prices, setPrices] = useState<Record<string, Price>>({}); // accumulates as you scroll
  const [done, setDone] = useState<Set<string>>(() => new Set()); // ids whose price lookup finished
  const inflight = useRef<Set<string>>(new Set()); // de-dupe in-flight requests
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  // Reset prices when the search itself changes (render-time check avoids a flash of stale prices).
  const searchSig = `${hotels.length}:${hotels[0]?.id ?? ""}:${hotels[hotels.length - 1]?.id ?? ""}|${checkin}|${checkout}|${adults}`;
  const [prevSearchSig, setPrevSearchSig] = useState(searchSig);
  if (searchSig !== prevSearchSig) {
    setPrevSearchSig(searchSig);
    setPrices({});
    setDone(new Set());
  }
  useEffect(() => {
    inflight.current = new Set();
  }, [searchSig]);

  const cardQuery = new URLSearchParams({
    ...(checkin ? { checkin } : {}),
    ...(checkout ? { checkout } : {}),
    adults: String(adults),
  }).toString();

  const visible = useMemo(
    () => applySort(applyFilters(hotels, prices, filters), prices, sort),
    [hotels, prices, filters, sort],
  );
  const n = activeFilterCount(filters);

  // Infinite scroll — reveal more as you scroll (no next-page clicks).
  const PAGE = 18;
  const [shown, setShown] = useState(PAGE);
  // reset to the first batch whenever the filtered/sorted set changes (render-time = lint-safe)
  const sig = `${JSON.stringify(filters)}|${sort}`;
  const [prevSig, setPrevSig] = useState(sig);
  if (sig !== prevSig) {
    setPrevSig(sig);
    setShown(PAGE);
  }
  const paged = visible.slice(0, shown);
  const hasMore = shown < visible.length;

  // Per-page price loading: fetch live "from" prices only for the cards currently revealed (not all
  // ~500 up front), so big-city result sets stay fast. Each scroll step fetches just the new ids.
  const pagedSig = paged.map((h) => h.id).join(",");
  useEffect(() => {
    const toFetch = paged.filter((h) => !done.has(h.id) && !inflight.current.has(h.id)).map((h) => h.id);
    if (!toFetch.length) return;
    // Debounce: fast-scrolling fires this on every page step, which spews a burst of rate calls that
    // time each other out. Wait for the scroll to settle, then fetch the revealed cards in one batch.
    const timer = setTimeout(() => {
      toFetch.forEach((id) => inflight.current.add(id));
      const settle = (got: Record<string, Price>) => {
        if (Object.keys(got).length) setPrices((p) => ({ ...p, ...got }));
        setDone((s) => {
          const n = new Set(s);
          toFetch.forEach((id) => n.add(id));
          return n;
        });
        toFetch.forEach((id) => inflight.current.delete(id));
      };
      fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelIds: toFetch, checkin, checkout, adults }),
      })
        .then((r) => r.json())
        .then((d) => settle((d.prices ?? {}) as Record<string, Price>))
        .catch(() => settle({}));
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagedSig, checkin, checkout, adults]);

  const sentinel = useRef<HTMLButtonElement>(null);
  // Re-create the observer whenever `shown` changes too: a fresh observe() immediately re-fires if the
  // sentinel is still in view, so it keeps loading until the sentinel scrolls past — fixing the classic
  // "stuck on Loading more" bug where IntersectionObserver only fires once on enter.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setShown((c) => Math.min(c + PAGE, visible.length));
      },
      { rootMargin: "800px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible.length, shown]);

  // Immediate-apply handlers for the inline chips (they share `filters` with the full sheet).
  const { maxPrice, minRating, stars, amenities, kind } = filters;
  const setKind = (v: Filters["kind"]) => setFilters((f) => ({ ...f, kind: v }));
  const setMaxPrice = (v: number | null) => setFilters((f) => ({ ...f, maxPrice: v }));
  const setMinRating = (v: number | null) => setFilters((f) => ({ ...f, minRating: f.minRating === v ? null : v }));
  const toggleStar = (s: number) =>
    setFilters((f) => ({ ...f, stars: f.stars.includes(s) ? f.stars.filter((x) => x !== s) : [...f.stars, s] }));
  const toggleAmenity = (a: string) =>
    setFilters((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));
  const QUICK = ["Pool", "Free WiFi", "Parking", "Breakfast"];

  return (
    <div>
      {/* single slidable filter chip row (saves vertical space) */}
      <div className="flex flex-nowrap items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setOpen(true)}
          className={`shrink-0 inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
            n > 0 ? "bg-accent-tint text-accent border-accent/40 font-medium" : "border-black/20 text-black/75 hover:border-black/40"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          All filters{n ? ` (${n})` : ""}
        </button>

        <FilterChip
          label={kind === "all" ? "Property type" : kind === "hotels" ? "Hotels & resorts" : "Vacation rentals"}
          active={kind !== "all"}
        >
          <div className="flex flex-col gap-1.5">
            {(
              [
                ["all", "All property types"],
                ["hotels", "Hotels & resorts"],
                ["rentals", "Vacation rentals"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setKind(v)}
                className={`text-left text-sm px-3 py-2 rounded-md border transition ${
                  kind === v ? "bg-accent-tint text-accent border-accent/40" : "border-black/10 hover:border-black/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterChip>

        <FilterChip label={maxPrice != null ? `Up to $${maxPrice}/night` : "Price"} active={maxPrice != null}>
          <p className="font-medium text-sm mb-2">Max price / night</p>
          <input
            type="range"
            min={50}
            max={1500}
            step={50}
            value={maxPrice ?? 1500}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxPrice(v >= 1500 ? null : v);
            }}
            className="w-full accent-accent"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-black/60">{maxPrice != null ? `Up to $${maxPrice}` : "Any price"}</span>
            {maxPrice != null ? (
              <button onClick={() => setMaxPrice(null)} className="text-sm text-accent">
                Reset
              </button>
            ) : null}
          </div>
        </FilterChip>

        <FilterChip label={minRating != null ? `${minRating}+ rating` : "Guest rating"} active={minRating != null}>
          <div className="flex flex-col gap-1.5">
            {RATING_OPTIONS.map((o) => (
              <button
                key={o.v}
                onClick={() => setMinRating(o.v)}
                className={`text-left text-sm px-3 py-2 rounded-md border transition ${
                  minRating === o.v ? "bg-accent-tint text-accent border-accent/40" : "border-black/10 hover:border-black/30"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </FilterChip>

        <FilterChip
          label={stars.length ? `${[...stars].sort((a, b) => b - a).join(", ")}-star` : "Star rating"}
          active={stars.length > 0}
        >
          <p className="font-medium text-sm mb-2">Star rating</p>
          <div className="flex gap-2">
            {STAR_OPTIONS.map((s) => (
              <button key={s} onClick={() => toggleStar(s)} className={chip(stars.includes(s))}>
                {s} ★
              </button>
            ))}
          </div>
        </FilterChip>

        <FilterChip label={amenities.length ? `Amenities (${amenities.length})` : "Amenities"} active={amenities.length > 0}>
          <div className="flex flex-col gap-1">
            {ALL_AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2.5 text-sm py-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="w-4 h-4 accent-accent"
                />
                {a}
              </label>
            ))}
          </div>
        </FilterChip>

        {QUICK.map((a) => (
          <button
            key={a}
            onClick={() => toggleAmenity(a)}
            className={`shrink-0 inline-flex items-center text-sm px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
              amenities.includes(a)
                ? "bg-accent-tint text-accent border-accent/40 font-medium"
                : "border-black/20 text-black/75 hover:border-black/40"
            }`}
          >
            {a}
          </button>
        ))}

        {n > 0 ? (
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="shrink-0 text-sm text-black/50 underline whitespace-nowrap px-1">
            Clear all
          </button>
        ) : null}
      </div>

      {/* count + sort + view */}
      <div className="flex items-center justify-between gap-2 mt-3 mb-3">
        <p className="text-sm text-black/55">
          {visible.length} stays{paged.some((h) => !done.has(h.id)) ? " · loading prices…" : ""}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort results"
          className="border border-black/15 rounded-lg px-2 py-1.5 text-sm bg-white"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              {SORT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {view === "map" ? (
        <MapResults hotels={visible} prices={prices} query={cardQuery} onClose={() => setView("list")} />
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-black/50">
          No stays match your filters.{" "}
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-accent">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:gap-4">
            {paged.map((h, idx) => (
              <HotelRow
                key={h.id}
                hotel={h}
                query={cardQuery}
                price={prices[h.id] ?? null}
                loading={!done.has(h.id)}
                priority={idx < 2}
              />
            ))}
          </div>
          {hasMore ? (
            <button
              ref={sentinel}
              type="button"
              onClick={() => setShown((c) => Math.min(c + PAGE, visible.length))}
              className="mt-2 w-full rounded-full border border-black/15 py-3.5 text-center text-sm font-medium text-black/70 transition hover:border-black/35 hover:text-black"
            >
              Show more stays
            </button>
          ) : (
            <p className="py-8 text-center text-sm text-black/35">That&apos;s all {visible.length} stays.</p>
          )}
        </>
      )}

      {/* floating Map button (Expedia puts it right in the results stream) */}
      {view === "list" && visible.length > 0 ? (
        <button
          onClick={() => setView("map")}
          aria-label="View results on map"
          className="fixed left-4 z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] inline-flex items-center gap-2 bg-accent text-white font-semibold text-sm px-5 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.28)] hover:opacity-90 active:scale-95 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
            <path d="M9 3v15" />
            <path d="M15 6v15" />
          </svg>
          Map
        </button>
      ) : null}

      {open ? (
        <FilterSheet
          hotels={hotels}
          prices={prices}
          initial={filters}
          onApply={(f) => {
            setFilters(f);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function FilterSheet({
  hotels,
  prices,
  initial,
  onApply,
  onClose,
}: {
  hotels: CardHotel[];
  prices: Record<string, Price> | null;
  initial: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(initial);
  const live = useMemo(() => applyFilters(hotels, prices, draft).length, [hotels, prices, draft]);

  const toggleStar = (s: number) =>
    setDraft((d) => ({ ...d, stars: d.stars.includes(s) ? d.stars.filter((x) => x !== s) : [...d.stars, s] }));
  const toggleAmenity = (a: string) =>
    setDraft((d) => ({ ...d, amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a] }));

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-black/10">
        <h2 className="font-semibold text-lg">Filters</h2>
        <button onClick={onClose} aria-label="Close" className="p-1 text-black/60">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-7 max-w-2xl w-full mx-auto">
        <section>
          <p className="font-medium mb-2">Max price / night</p>
          <input
            type="range"
            min={50}
            max={1500}
            step={50}
            value={draft.maxPrice ?? 1500}
            onChange={(e) => {
              const v = Number(e.target.value);
              setDraft((d) => ({ ...d, maxPrice: v >= 1500 ? null : v }));
            }}
            className="w-full accent-accent"
          />
          <p className="text-sm text-black/60">{draft.maxPrice != null ? `Up to $${draft.maxPrice}/night` : "Any price"}</p>
        </section>

        <section>
          <p className="font-medium mb-2">Guest rating</p>
          <div className="flex gap-2 flex-wrap">
            {RATING_OPTIONS.map((o) => (
              <button
                key={o.v}
                onClick={() => setDraft((d) => ({ ...d, minRating: d.minRating === o.v ? null : o.v }))}
                className={chip(draft.minRating === o.v)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="font-medium mb-2">Star rating</p>
          <div className="flex gap-2">
            {STAR_OPTIONS.map((s) => (
              <button key={s} onClick={() => toggleStar(s)} className={chip(draft.stars.includes(s))}>
                {s} ★
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="font-medium mb-2">Amenities</p>
          <div className="flex gap-2 flex-wrap">
            {ALL_AMENITIES.map((a) => (
              <button key={a} onClick={() => toggleAmenity(a)} className={chip(draft.amenities.includes(a))}>
                {a}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-black/10 flex items-center justify-between gap-3 max-w-2xl w-full mx-auto">
        <button onClick={() => setDraft(EMPTY_FILTERS)} className="text-sm text-black/60 underline">
          Clear all
        </button>
        <button
          onClick={() => onApply(draft)}
          className="bg-accent text-white font-medium px-6 py-3 rounded-full flex-1 max-w-xs"
        >
          Show {live} {live === 1 ? "stay" : "stays"}
        </button>
      </div>
    </div>
  );
}
