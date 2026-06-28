"use client";

import { useEffect, useRef, useState } from "react";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parse(s?: string) {
  return s ? new Date(s + "T00:00:00") : null;
}
function fmt(s?: string) {
  return s ? new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
}

export default function DateField({
  checkin,
  checkout,
  onChange,
}: {
  checkin?: string;
  checkout?: string;
  onChange: (ci: string, co: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const ci = parse(checkin);
  const co = parse(checkout);

  function pick(day: Date) {
    if (!ci || (ci && co)) onChange(ymd(day), "");
    else if (day > ci) {
      onChange(ymd(ci), ymd(day));
      setOpen(false);
    } else onChange(ymd(day), "");
  }

  const year = view.getFullYear();
  const month = view.getMonth();
  const startBlank = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startBlank).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const atCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const label = ci ? `${fmt(checkin)}${co ? ` – ${fmt(checkout)}` : " – ?"}` : "Add dates";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-left transition hover:border-black/30"
      >
        <svg className="shrink-0 text-black/60" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-black/60">Dates</span>
          <span className={`block mt-0.5 text-[15px] font-medium truncate ${ci ? "text-black/90" : "text-black/60"}`}>{label}</span>
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 z-[70] mt-2 w-[300px] bg-white border border-black/10 rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setView(new Date(year, month - 1, 1))}
              disabled={atCurrentMonth}
              className="w-8 h-8 grid place-items-center rounded-md hover:bg-black/5 disabled:opacity-30"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="text-sm font-medium">
              {view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="w-8 h-8 grid place-items-center rounded-md hover:bg-black/5"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-black/60 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const dd = new Date(d);
              dd.setHours(0, 0, 0, 0);
              const past = dd < today;
              const isEdge = (ci && ymd(dd) === ymd(ci)) || (co && ymd(dd) === ymd(co));
              const inRange = ci && co && dd > ci && dd < co;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={past}
                  onClick={() => pick(dd)}
                  className={`h-9 rounded-full text-sm ${
                    past ? "text-black/25" : isEdge ? "bg-accent text-white" : inRange ? "bg-accent-tint text-accent" : "hover:bg-black/5"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
