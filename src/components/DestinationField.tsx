"use client";

import { useEffect, useRef, useState } from "react";
import { REGIONS } from "@/lib/regions";

// Same pill styling as the other search fields.
const FIELD =
  "w-full flex items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-left transition hover:border-black/30 focus-within:border-accent";

type Suggestion = {
  id: string;
  title: string;
  subtitle: string;
  value: string; // what we put in the box — resolves via searchDirectory()
  kind: "region" | "city";
};

// Default list (before typing): the curated markets, as a friendly starting point.
const POPULAR: Suggestion[] = REGIONS.map((r) => {
  const state = r.label.split(",").slice(1).join(",").trim();
  return {
    id: `r-${r.slug}`,
    title: r.name,
    subtitle: state ? `${state}, USA` : "United States",
    value: r.label,
    kind: "region",
  };
});

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

interface CityResult {
  city: string;
  state: string | null;
  country: string;
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
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Debounced lookup against our own directory (free; no external autocomplete API). All state
  // updates happen inside the async timeout (not synchronously in the effect body).
  useEffect(() => {
    const q = value.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const d = (await res.json()) as { cities?: CityResult[] };
        setResults(
          (d.cities ?? []).map((c) => ({
            id: `db-${c.city}-${c.country}`,
            title: c.city,
            subtitle: c.state ? `${c.state}, ${(c.country || "").toUpperCase()}` : "United States",
            value: c.state ? `${c.city}, ${c.state}` : c.city,
            kind: "city" as const,
          })),
        );
        setLoading(false);
      } catch {
        /* aborted or failed — keep the last results */
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  const typing = value.trim().length >= 2;
  const hasResults = results.length > 0;
  const list: Suggestion[] = typing ? (hasResults ? results : loading ? [] : POPULAR) : POPULAR;
  const header = !typing
    ? "Popular destinations"
    : hasResults
      ? ""
      : loading
        ? "Searching…"
        : "No matches — popular destinations";

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
      e.preventDefault();
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
            onFocus={(e) => { setOpen(true); e.currentTarget.select(); }}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            required
            placeholder="City, state, or destination"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            className="w-full bg-transparent outline-none text-[15px] font-medium mt-0.5 placeholder:font-normal placeholder:text-black/40"
          />
        </span>
        {value ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(""); setOpen(true); }}
            aria-label="Clear destination"
            className="shrink-0 self-center rounded-full p-1 text-black/35 transition hover:bg-black/[0.06] hover:text-black/70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        ) : null}
      </label>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
          {header ? (
            <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40">{header}</p>
          ) : null}
          <ul className="py-1">
            {list.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
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
