"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { REGIONS } from "@/lib/regions";

// Same pill styling as the other search fields.
const FIELD = "w-full flex items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-left transition hover:border-black/30 focus-within:border-accent";

type Suggestion = {
  id: string;
  title: string; // bold line, e.g. "Honolulu"
  subtitle: string; // muted line, e.g. "Oahu, Hawaii"
  value: string; // what we put in the box — must resolve via searchHotels()
  match: string; // lowercased haystack for filtering (title + subtitle + region terms)
  kind: "region" | "city" | "area";
};

// Build the suggestion list once from the markets we actually cover. Every `value` is chosen so
// searchHotels() resolves it: cities narrow within a region; regions/areas fall back to the region.
const SUGGESTIONS: Suggestion[] = REGIONS.flatMap((r) => {
  const state = r.label.split(",").slice(1).join(",").trim();
  const sub = state ? `${state}, USA` : "USA";
  const region: Suggestion = {
    id: `r-${r.slug}`,
    title: r.name,
    subtitle: sub,
    value: r.label,
    match: `${r.name} ${sub} ${r.terms.join(" ")}`.toLowerCase(),
    kind: "region",
  };
  const cities: Suggestion[] = r.cities
    .filter((c) => c.toLowerCase() !== r.name.toLowerCase())
    .map((c) => ({
      id: `c-${r.slug}-${c}`,
      title: c,
      subtitle: r.label,
      value: c,
      match: `${c} ${r.label}`.toLowerCase(),
      kind: "city",
    }));
  const areas: Suggestion[] = r.landmarks
    .filter((l) => !l.airport && l.name !== r.anchor)
    .slice(0, 4)
    .map((l) => ({
      id: `a-${r.slug}-${l.name}`,
      title: l.name,
      subtitle: r.label,
      value: r.label,
      match: `${l.name} ${r.label}`.toLowerCase(),
      kind: "area",
    }));
  return [region, ...cities, ...areas];
});

const REGION_ONLY = SUGGESTIONS.filter((s) => s.kind === "region");

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" />
    </svg>
  );
}

export default function DestinationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // What to show: typed → ranked matches; empty → the markets we cover. Falls back to the market
  // list (with a header) when the text matches nothing, so people land somewhere real.
  const { list, header } = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return { list: REGION_ONLY, header: "Popular destinations" };
    // Match at a word boundary so "wai" hits Wailea/Waikiki but not Ha·wai·i, while "las vegas"
    // (multi-word) still matches. \b before the escaped query does both.
    const re = new RegExp("\\b" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const hits = SUGGESTIONS.filter((s) => re.test(s.match))
      .sort((a, b) => Number(b.title.toLowerCase().startsWith(q)) - Number(a.title.toLowerCase().startsWith(q)))
      .slice(0, 7);
    if (hits.length) return { list: hits, header: "" };
    return { list: REGION_ONLY, header: "We're live in these markets" };
  }, [value]);

  function choose(s: Suggestion) {
    onChange(s.value);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && active >= 0 && list[active]) {
      e.preventDefault(); // pick the highlighted item instead of submitting the form
      choose(list[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <label className={`${FIELD} cursor-text`}>
        <svg className="shrink-0 text-black/40" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 4.4-5.5 9-8 11-2.5-2-8-6.6-8-11a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-black/45">Where to?</span>
          <input
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            required
            placeholder="Oahu, Hawaii"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            className="w-full bg-transparent outline-none text-[15px] font-medium mt-0.5 placeholder:font-normal placeholder:text-black/40"
          />
        </span>
      </label>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
          {header ? (
            <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40">{header}</p>
          ) : null}
          <ul className="py-1">
            {list.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  // mousedown fires before the input blur, so the pick isn't lost to a close
                  onMouseDown={(e) => { e.preventDefault(); choose(s); }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${i === active ? "bg-accent-tint/60" : "hover:bg-black/[0.03]"}`}
                >
                  <BuildingIcon className={s.kind === "region" ? "text-accent shrink-0" : "text-black/35 shrink-0"} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight truncate">{s.title}</span>
                    <span className="block text-xs text-black/50 truncate">{s.subtitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
