"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VERTICALS } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals";
import DateField from "@/components/DateField";
import GuestField from "@/components/GuestField";

type Initial = { destination?: string; checkin?: string; checkout?: string; adults?: string };

function fmtDay(d: string) {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Short labels for the tab row (kept tight under the icons, Expedia-style).
const TAB_LABEL: Record<Vertical, string> = {
  hotels: "Hotels",
  flights: "Flights",
  cars: "Cars",
  "things-to-do": "Tours",
};

// The icon for each vertical (line icons, matched weight to the rest of the UI).
function VerticalIcon({ id }: { id: Vertical }) {
  const p = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (id) {
    case "hotels":
      return (<svg {...p}><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>);
    case "flights":
      return (<svg {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>);
    case "cars":
      return (<svg {...p}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>);
    default:
      return (<svg {...p}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v14" /></svg>);
  }
}

// Shared style for the three input "pill" fields (Where / Dates / Travelers).
const FIELD = "w-full flex items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-left transition hover:border-black/30 focus-within:border-accent";

export default function SearchPanel({
  initial,
  active = "hotels",
  compact = false,
}: {
  initial?: Initial;
  active?: Vertical;
  compact?: boolean;
}) {
  const router = useRouter();
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [checkin, setCheckin] = useState(initial?.checkin ?? "");
  const [checkout, setCheckout] = useState(initial?.checkout ?? "");
  const [adults, setAdults] = useState(initial?.adults ? parseInt(initial.adults, 10) : 2);
  const [rooms, setRooms] = useState(1);
  const [open, setOpen] = useState(!compact);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    q.set("destination", destination);
    if (checkin) q.set("checkin", checkin);
    if (checkout) q.set("checkout", checkout);
    q.set("adults", String(adults));
    router.push(`/search?${q.toString()}`);
    if (compact) setOpen(false);
  }

  // Collapsed Expedia-style summary bar — one tappable line, opens the full form.
  if (compact && !open) {
    const dateLabel = checkin && checkout ? `${fmtDay(checkin)} – ${fmtDay(checkout)}` : "Any dates";
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-white border border-black/10 rounded-lg px-4 py-2.5 flex items-center gap-3 text-left hover:border-black/25 transition shadow-sm"
      >
        <span className="grid place-items-center w-9 h-9 rounded-full bg-accent-tint text-accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block font-semibold truncate">{destination || "Search hotels"}</span>
          <span className="block text-xs text-black/55 truncate">
            {dateLabel} · {adults} traveler{adults > 1 ? "s" : ""}
          </span>
        </span>
        <span className="ml-auto text-sm font-medium text-accent shrink-0">Edit</span>
      </button>
    );
  }

  return (
    <div className={`${compact ? "" : "mx-auto max-w-xl"} bg-white rounded-2xl border border-black/5 shadow-sm p-3 sm:p-4`}>
      {/* Vertical switcher — Hotels is live; the rest are greyed with a "Soon" badge. */}
      <div className="flex border-b border-black/10 mb-4">
        {VERTICALS.map((v) => {
          const isActive = v.id === active;
          const inner = (
            <span className="relative flex w-full flex-col items-center gap-1 pt-1 pb-2.5">
              <VerticalIcon id={v.id} />
              <span className="text-xs font-medium">{TAB_LABEL[v.id]}</span>
              {!v.enabled ? (
                <span className="absolute right-1 -top-0.5 rounded bg-black/[0.07] px-1 py-px text-[8px] font-bold uppercase tracking-wide text-black/40">
                  Soon
                </span>
              ) : null}
            </span>
          );
          const base = "flex flex-1 justify-center border-b-2 -mb-px";
          if (isActive) {
            return (
              <span key={v.id} aria-current="page" className={`${base} border-accent text-accent`}>
                {inner}
              </span>
            );
          }
          if (v.enabled) {
            return (
              <Link key={v.id} href={v.href} className={`${base} border-transparent text-black/55 hover:text-black`}>
                {inner}
              </Link>
            );
          }
          return (
            <span
              key={v.id}
              aria-disabled="true"
              title="Coming soon"
              className={`${base} border-transparent text-black/30 cursor-not-allowed select-none`}
            >
              {inner}
            </span>
          );
        })}
      </div>

      <form onSubmit={submit} className="space-y-2.5">
        {/* Where */}
        <label className={`${FIELD} cursor-text`}>
          <svg className="shrink-0 text-black/40" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 4.4-5.5 9-8 11-2.5-2-8-6.6-8-11a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-black/45">Where to?</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="Oahu, Hawaii"
              className="w-full bg-transparent outline-none text-[15px] font-medium mt-0.5 placeholder:font-normal placeholder:text-black/40"
            />
          </span>
        </label>

        <DateField checkin={checkin} checkout={checkout} onChange={(ci, co) => { setCheckin(ci); setCheckout(co); }} />
        <GuestField adults={adults} rooms={rooms} onChange={(a, r) => { setAdults(a); setRooms(r); }} />

        <button
          type="submit"
          className="w-full bg-accent text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search
        </button>
      </form>
    </div>
  );
}
