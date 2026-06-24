"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HotelRow from "./HotelRow";
import MapResults from "./MapResults";
import type { CardHotel } from "@/lib/oahu";

// City-hub inventory: the top stays in a city, sliceable by relevance (real directory fields only —
// stars, guest rating, review count, property type) with a list⇄map toggle. No dates yet, so cards
// invite the visitor to pick dates (awaitingDates) rather than show a price. "See all" → full search.
type Category = { key: string; label: string; test?: (h: CardHotel) => boolean; sort?: (a: CardHotel, b: CardHotel) => number };

const pill = (active: boolean) =>
  `shrink-0 inline-flex items-center text-sm px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
    active ? "bg-accent-tint text-accent border-accent/40 font-medium" : "border-black/20 text-black/75 hover:border-black/40"
  }`;

export default function CityResults({
  cards,
  city,
  countLabel,
  searchHref,
}: {
  cards: CardHotel[];
  city: string;
  countLabel: string;
  searchHref: string;
}) {
  const [cat, setCat] = useState("top");
  const [view, setView] = useState<"list" | "map">("list");

  // Only surface a category chip when there's a real, non-trivial set behind it.
  const cats = useMemo<Category[]>(() => {
    const out: Category[] = [{ key: "top", label: "Top rated" }]; // default = the ranked order passed in
    if (cards.filter((h) => h.reviewCount).length >= 3)
      out.push({ key: "reviewed", label: "Most reviewed", sort: (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0) });
    if (cards.filter((h) => (h.rating ?? 0) >= 9).length >= 3)
      out.push({ key: "exceptional", label: "Exceptional 9+", test: (h) => (h.rating ?? 0) >= 9 });
    if (cards.filter((h) => (h.stars ?? 0) >= 4).length >= 3)
      out.push({ key: "lux", label: "4★ & up", test: (h) => (h.stars ?? 0) >= 4 });
    if (cards.filter((h) => h.propertyType === "Resort").length >= 2)
      out.push({ key: "resort", label: "Resorts", test: (h) => h.propertyType === "Resort" });
    return out;
  }, [cards]);

  const active = cats.find((c) => c.key === cat) ?? cats[0];
  const visible = useMemo(() => {
    const filtered = active.test ? cards.filter(active.test) : cards;
    return active.sort ? [...filtered].sort(active.sort) : filtered;
  }, [cards, active]);

  return (
    <div className="mt-5">
      {/* one slidable category row (relevance, not fake filters) */}
      <div className="flex flex-nowrap items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {cats.map((c) => (
          <button key={c.key} type="button" onClick={() => setCat(c.key)} className={pill(c.key === cat)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* count + list/map toggle */}
      <div className="mt-3 mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-black/55">
          Showing {visible.length} of {countLabel} stays
        </p>
        <button
          type="button"
          onClick={() => setView((v) => (v === "list" ? "map" : "list"))}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/20 px-3.5 py-2 text-sm text-black/75 transition hover:border-black/40"
        >
          {view === "list" ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><path d="M9 3v15" /><path d="M15 6v15" />
              </svg>
              Map
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </>
          )}
        </button>
      </div>

      {view === "map" ? (
        <MapResults hotels={visible} prices={null} query="adults=2" onClose={() => setView("list")} />
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {visible.map((h, i) => (
            <HotelRow key={h.id} hotel={h} query="adults=2" awaitingDates priority={i < 2} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href={searchHref}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          See all {countLabel} hotels in {city}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
