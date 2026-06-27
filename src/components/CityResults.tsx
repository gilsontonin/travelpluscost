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

// Quick date windows (Expedia "Check prices for these dates"). Default = tomorrow (1 night).
const DATE_OPTS = [
  { key: "tonight", label: "Tonight" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "weekend", label: "This weekend" },
  { key: "next-weekend", label: "Next weekend" },
];
const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
function datesFor(key: string): { checkin: string; checkout: string } {
  const toFri = (5 - new Date().getDay() + 7) % 7; // days to the upcoming Friday (0 if today is Friday)
  switch (key) {
    case "tonight":
      return { checkin: iso(0), checkout: iso(1) };
    case "weekend":
      return { checkin: iso(toFri), checkout: iso(toFri + 2) };
    case "next-weekend":
      return { checkin: iso(toFri + 7), checkout: iso(toFri + 9) };
    default: // tomorrow
      return { checkin: iso(1), checkout: iso(2) };
  }
}

// Property-type chips — each surfaces only when the city has a real set of that type (raw directory
// `property_type`, e.g. "Resort"/"Motel"/"B&B"). "Hotel" is the default majority so it's omitted; these
// let people slice a city's inventory by stay type, same "only show a chip with a real set behind it"
// rule as the rating/stars chips.
const TYPE_CHIPS: { type: string; label: string }[] = [
  { type: "Resort", label: "Resorts" },
  { type: "Aparthotel", label: "Aparthotels" },
  { type: "B&B", label: "B&Bs" },
  { type: "Inn", label: "Inns" },
  { type: "Lodge", label: "Lodges" },
  { type: "Motel", label: "Motels" },
  { type: "Hostel", label: "Hostels" },
  { type: "Guesthouse", label: "Guesthouses" },
];

// Amenity chips — only the high-demand, *differentiating* amenities (the ones people actively filter FOR
// that genuinely narrow a city's set). Deliberately NOT the near-universal ones — Parking (92% of hotels),
// Free WiFi (54%), Gym (50%), Restaurant, Breakfast — those would surface in every city and narrow nothing.
// A chip still only appears when ≥4 hotels have it AND it's ≤90% of the set (a second backstop vs noise).
const AMENITY_CHIPS = ["Pool", "Beachfront", "Pet-friendly", "Spa", "Hot tub"];

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
  const [dateKey, setDateKey] = useState("tomorrow");
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const inflight = useRef<Set<string>>(new Set());

  const { checkin, checkout } = useMemo(() => datesFor(dateKey), [dateKey]);
  const cardQuery = `checkin=${checkin}&checkout=${checkout}&adults=2`;

  // New dates → clear cached prices so the cards re-fetch for them (render-time check, lint-safe).
  const dsig = `${checkin}|${checkout}`;
  const [prevDsig, setPrevDsig] = useState(dsig);
  if (dsig !== prevDsig) {
    setPrevDsig(dsig);
    setPrices({});
    setDone(new Set());
  }
  // Reset in-flight tracking when the date window changes (refs can't be mutated during render).
  useEffect(() => {
    inflight.current = new Set();
  }, [dsig]);

  // Only surface a category chip when there's a real, non-trivial set behind it.
  const cats = useMemo<Category[]>(() => {
    const out: Category[] = [{ key: "top", label: "Top rated" }]; // default = the ranked order passed in
    if (cards.filter((h) => h.reviewCount).length >= 3)
      out.push({ key: "reviewed", label: "Most reviewed", sort: (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0) });
    if (cards.filter((h) => (h.rating ?? 0) >= 9).length >= 3)
      out.push({ key: "exceptional", label: "Exceptional 9+", test: (h) => (h.rating ?? 0) >= 9 });
    if (cards.filter((h) => (h.stars ?? 0) >= 4).length >= 3)
      out.push({ key: "lux", label: "4★ & up", test: (h) => (h.stars ?? 0) >= 4 });
    for (const { type, label } of TYPE_CHIPS) {
      if (cards.filter((h) => h.propertyType === type).length >= 2)
        out.push({ key: `type:${type}`, label, test: (h) => h.propertyType === type });
    }
    const amenCap = Math.floor(cards.length * 0.9);
    for (const a of AMENITY_CHIPS) {
      const cnt = cards.filter((h) => h.amenities?.includes(a)).length;
      if (cnt >= 4 && cnt <= amenCap)
        out.push({ key: `amen:${a}`, label: a, test: (h) => !!h.amenities?.includes(a) });
    }
    return out;
  }, [cards]);

  const active = cats.find((c) => c.key === cat) ?? cats[0];
  const visible = useMemo(() => {
    const filtered = active.test ? cards.filter(active.test) : cards;
    return (active.sort ? [...filtered].sort(active.sort) : filtered).slice(0, SHOWN);
  }, [cards, active]);

  // Bubble cards that have a loaded price above the sold-out ones (stable within the category order),
  // so the hero card shows a number. Reorders once when the price batch lands.
  const ordered = useMemo(
    () => [...visible].sort((a, b) => (prices[b.id] ? 1 : 0) - (prices[a.id] ? 1 : 0)),
    [visible, prices],
  );

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
      {/* date chips — drive the indicative price (Expedia "Check prices for these dates") */}
      <p className="mb-1.5 text-xs font-medium text-black/45">Check prices for these dates</p>
      <div className="mb-3 flex flex-nowrap items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {DATE_OPTS.map((o) => (
          <button key={o.key} type="button" onClick={() => setDateKey(o.key)} className={pill(o.key === dateKey)}>
            {o.label}
          </button>
        ))}
      </div>

      {/* one slidable category row (relevance, not fake filters) */}
      <div className="flex flex-nowrap items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {cats.map((c) => (
          <button key={c.key} type="button" onClick={() => setCat(c.key)} className={pill(c.key === cat)}>
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-3 mb-3 text-sm text-black/55">
        Showing {visible.length} of {countLabel} stays
      </p>

      {view === "map" ? (
        <MapResults hotels={ordered} prices={prices} query={cardQuery} onClose={() => setView("list")} />
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {ordered.map((h, i) => (
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

      {/* sticky CTA bar pinned to the bottom of the page — persistent map access */}
      {view === "list" && visible.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 flex justify-center px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] backdrop-blur">
          <button
            type="button"
            onClick={() => setView("map")}
            className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
              <path d="M9 3v15" />
              <path d="M15 6v15" />
            </svg>
            View map
          </button>
        </div>
      ) : null}

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
