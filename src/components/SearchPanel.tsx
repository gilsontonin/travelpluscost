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
    <div className="bg-[#efeff3] rounded-lg p-3 sm:p-4">
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {VERTICALS.map((v) => (
          <Link
            key={v.id}
            href={v.href}
            className={`whitespace-nowrap text-sm px-4 py-2 rounded-md transition ${
              v.id === active ? "bg-accent-tint text-accent font-medium" : "text-black/55 hover:bg-white"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-lg p-2 grid grid-cols-1 sm:grid-cols-[1.5fr_1.3fr_1.1fr_auto] gap-1 sm:gap-2 items-stretch"
      >
        <label className="flex flex-col justify-center px-4 py-2 rounded-md border border-transparent hover:border-black/5 cursor-text">
          <span className="text-[11px] uppercase tracking-wide text-black/40">Where</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="Oahu, Hawaii"
            className="w-full outline-none text-sm bg-transparent mt-0.5"
          />
        </label>

        <DateField checkin={checkin} checkout={checkout} onChange={(ci, co) => { setCheckin(ci); setCheckout(co); }} />
        <GuestField adults={adults} rooms={rooms} onChange={(a, r) => { setAdults(a); setRooms(r); }} />

        <button
          type="submit"
          className="bg-accent text-white font-medium px-5 py-3 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search
        </button>
      </form>
    </div>
  );
}
