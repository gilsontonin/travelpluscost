"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import HotelRow from "./HotelRow";
import MapResults from "./MapResults";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";

// City-hub inventory: the top stays in a city, sliceable by relevance (real directory fields only —
// stars, guest rating, review count, property type) with a list⇄map toggle. No dates are chosen, so
// we show an INDICATIVE "from" price for tomorrow night (1 night), fetched live + lazily for the cards
// on screen — the same dates ride along in the card link, so clicking shows the very same price.
const SHOWN = 18; // cards rendered here (rest → full search). Bounds live price calls per pageview.

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
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const inflight = useRef<Set<string>>(new Set());

  // Indicative dates = tomorrow night, 1 night. One place to tune (e.g. push out 2 weeks for more
  // availability / a lower "from" number). toISOString is UTC; close enough for an indicative rate.
  const { checkin, checkout } = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const ci = d.toISOString().slice(0, 10);
    d.setDate(d.getDate() + 1);
    return { checkin: ci, checkout: d.toISOString().slice(0, 10) };
  }, []);
  const cardQuery = `checkin=${checkin}&checkout=${checkout}&adults=2`;

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
    return (active.sort ? [...filtered].sort(active.sort) : filtered).slice(0, SHOWN);
  }, [cards, active]);

  // Lazy "from" price for the cards on screen — debounced + de-duped (mirrors ResultsList). Cached per
  // id, so switching category only fetches newly-shown hotels.
  const visibleSig = visible.map((h) => h.id).join(",");
  useEffect(() => {
    const toFetch = visible.filter((h) => !done.has(h.id) && !inflight.current.has(h.id)).map((h) => h.id);
    if (!toFetch.length) return;
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
        body: JSON.stringify({ hotelIds: toFetch, checkin, checkout, adults: 2 }),
      })
        .then((r) => r.json())
        .then((d) => settle((d.prices ?? {}) as Record<string, Price>))
        .catch(() => settle({}));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSig, checkin, checkout]);

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
        <MapResults hotels={visible} prices={prices} query={cardQuery} onClose={() => setView("list")} />
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {visible.map((h, i) => (
            <HotelRow
              key={h.id}
              hotel={h}
              query={cardQuery}
              price={prices[h.id] ?? null}
              loading={!done.has(h.id)}
              awaitingDates
              priority={i < 2}
            />
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
