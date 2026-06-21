"use client";

import { useEffect, useMemo, useState } from "react";
import HotelRow from "./HotelRow";
import MapView from "@/components/MapView";
import FilterChip from "@/components/FilterChip";
import type { MapMarker } from "@/components/LeafletMap";
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

  const mapMarkers: MapMarker[] = useMemo(
    () =>
      visible
        .filter((h) => h.lat != null && h.lng != null)
        .map((h) => {
          const p = prices?.[h.id];
          return {
            id: h.id,
            lat: h.lat as number,
            lng: h.lng as number,
            label: p ? `$${p.perNight}` : undefined,
            href: `/hotel/${h.id}${cardQuery ? `?${cardQuery}` : ""}`,
          };
        }),
    [visible, prices, cardQuery],
  );
  const mapCenter: [number, number] = mapMarkers.length
    ? [
        mapMarkers.reduce((s, m) => s + m.lat, 0) / mapMarkers.length,
        mapMarkers.reduce((s, m) => s + m.lng, 0) / mapMarkers.length,
      ]
    : [21.4, -157.86];

  // Immediate-apply handlers for the inline chips (they share `filters` with the full sheet).
  const { maxPrice, minRating, stars, amenities } = filters;
  const setMaxPrice = (v: number | null) => setFilters((f) => ({ ...f, maxPrice: v }));
  const setMinRating = (v: number | null) => setFilters((f) => ({ ...f, minRating: f.minRating === v ? null : v }));
  const toggleStar = (s: number) =>
    setFilters((f) => ({ ...f, stars: f.stars.includes(s) ? f.stars.filter((x) => x !== s) : [...f.stars, s] }));
  const toggleAmenity = (a: string) =>
    setFilters((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));
  const QUICK = ["Pool", "Free WiFi", "Parking", "Breakfast"];

  return (
    <div>
      {/* top line: sort + view + all-filters */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label className="text-sm flex items-center gap-2 text-black/70">
          <span className="hidden sm:inline">Sort</span>
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
        </label>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setOpen(true)}
            className="text-sm border border-black/15 rounded-lg px-3 py-1.5 bg-white hover:border-black/40 flex items-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            All filters{n ? ` (${n})` : ""}
          </button>
        </div>
      </div>

      {/* inline quick-filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <FilterChip label={maxPrice != null ? `Up to $${maxPrice}/night` : "Price"} active={maxPrice != null}>
          <div className="w-60">
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
          </div>
        </FilterChip>

        <FilterChip label={minRating != null ? `${minRating}+ rating` : "Guest rating"} active={minRating != null}>
          <div className="w-52 flex flex-col gap-1.5">
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
          <div className="w-44">
            <p className="font-medium text-sm mb-2">Star rating</p>
            <div className="flex gap-2">
              {STAR_OPTIONS.map((s) => (
                <button key={s} onClick={() => toggleStar(s)} className={chip(stars.includes(s))}>
                  {s} ★
                </button>
              ))}
            </div>
          </div>
        </FilterChip>

        <FilterChip label={amenities.length ? `Amenities (${amenities.length})` : "Amenities"} active={amenities.length > 0}>
          <div className="w-64 max-h-72 overflow-y-auto flex flex-col gap-1">
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
          <button key={a} onClick={() => toggleAmenity(a)} className={chip(amenities.includes(a))}>
            {a}
          </button>
        ))}

        {n > 0 ? (
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm text-black/50 underline ml-1">
            Clear all
          </button>
        ) : null}
      </div>

      <p className="text-sm text-black/55 mb-3">
        {visible.length} of {hotels.length} stays
        {prices === null ? " · loading prices…" : ""}
      </p>

      {view === "map" ? (
        <MapView center={mapCenter} zoom={12} height={540} markers={mapMarkers} />
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-black/50">
          No stays match your filters.{" "}
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-accent">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 flex flex-col gap-0 sm:gap-4">
          {visible.map((h) => (
            <HotelRow key={h.id} hotel={h} query={cardQuery} price={prices?.[h.id] ?? null} loading={prices === null} />
          ))}
        </div>
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
