"use client";

import { useEffect, useRef, useState } from "react";

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn = "w-8 h-8 rounded-full border border-black/20 grid place-items-center disabled:opacity-30 hover:border-black/50";
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Fewer ${label}`}>
          −
        </button>
        <span className="w-5 text-center text-sm">{value}</span>
        <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`More ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export default function GuestField({
  adults,
  rooms,
  onChange,
}: {
  adults: number;
  rooms: number;
  onChange: (adults: number, rooms: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const label = `${adults} traveler${adults > 1 ? "s" : ""}, ${rooms} room${rooms > 1 ? "s" : ""}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-left transition hover:border-black/30"
      >
        <svg className="shrink-0 text-black/40" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-black/45">Travelers</span>
          <span className="block mt-0.5 text-[15px] font-medium text-black/90 truncate">{label}</span>
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-[70] mt-2 w-[240px] bg-white border border-black/10 rounded-lg shadow-xl p-3">
          <Stepper label="Adults" value={adults} min={1} max={8} onChange={(v) => onChange(v, rooms)} />
          <Stepper label="Rooms" value={rooms} min={1} max={4} onChange={(v) => onChange(adults, v)} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full bg-accent text-white text-sm font-medium py-2 rounded-md"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
