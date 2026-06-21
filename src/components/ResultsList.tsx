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
  const [prices, setPrices] = useState<Record<string, Price> | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  useEffect(() => {
    let on = true;
    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: hotels.map((h) => h.id), checkin, checkout, adults }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (on) setPrices(d.prices ?? {});
      })
      .catch(() => {
        if (on) setPrices({});
      });
    return () => {
      on = false;
    };
  }, [hotels, checkin, checkout, adults]);

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

  // Paginate the list so we don't stack all results at once.
  const PER_PAGE = 18;
  const [page, setPage] = useState(1);
  // reset to page 1 whenever the filtered/sorted set changes (render-time = lint-safe)
  const sig = `${JSON.stringify(filters)}|${sort}`;
  const [prevSig, setPrevSig] = useState(sig);
  if (sig !== prevSig) {
    setPrevSig(sig);
    setPage(1);
  }
  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const listTop = useRef<HTMLDivElement>(null);
  const goPage = (p: number) => {
    setPage(p);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          {visible.length > PER_PAGE
            ? `${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, visible.length)} of ${visible.length} stays`
            : `${visible.length} stays`}
          {prices === null ? " · loading prices…" : ""}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-black/15 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <div className="flex border border-black/15 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 ${view === "list" ? "bg-accent-tint text-accent font-medium" : "bg-white text-black/60"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 ${view === "map" ? "bg-accent-tint text-accent font-medium" : "bg-white text-black/60"}`}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {view === "map" ? (
        <MapResults hotels={visible} prices={prices} query={cardQuery} />
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-black/50">
          No stays match your filters.{" "}
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-accent">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div ref={listTop} className="scroll-mt-4 flex flex-col gap-3 sm:gap-4">
            {paged.map((h) => (
              <HotelRow key={h.id} hotel={h} query={cardQuery} price={prices?.[h.id] ?? null} loading={prices === null} />
            ))}
          </div>
          {pageCount > 1 ? <Pagination page={safePage} pageCount={pageCount} onGo={goPage} /> : null}
        </>
      )}

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

function Pagination({ page, pageCount, onGo }: { page: number; pageCount: number; onGo: (p: number) => void }) {
  // windowed page numbers with ellipsis
  const nums: (number | "…")[] = [];
  const push = (p: number) => nums.push(p);
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) push(i);
  } else {
    push(1);
    if (page > 3) nums.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) push(i);
    if (page < pageCount - 2) nums.push("…");
    push(pageCount);
  }

  const arrow = "w-9 h-9 rounded-md grid place-items-center text-black/70 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <nav className="mt-8 flex items-center justify-center gap-1 text-sm" aria-label="Pagination">
      <button onClick={() => onGo(page - 1)} disabled={page <= 1} className={arrow} aria-label="Previous page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      {nums.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="w-9 h-9 grid place-items-center text-black/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onGo(p)}
            aria-current={p === page ? "page" : undefined}
            className={`w-9 h-9 rounded-md ${p === page ? "bg-accent text-white font-medium" : "text-black/70 hover:bg-black/5"}`}
          >
            {p}
          </button>
        ),
      )}
      <button onClick={() => onGo(page + 1)} disabled={page >= pageCount} className={arrow} aria-label="Next page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </nav>
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
          className="bg-accent text-white font-medium px-6 py-3 rounded-lg flex-1 max-w-xs"
        >
          Show {live} {live === 1 ? "stay" : "stays"}
        </button>
      </div>
    </div>
  );
}
