"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Initial = { destination?: string; checkin?: string; checkout?: string; adults?: string };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col justify-center px-4 py-2 rounded-xl border border-transparent hover:border-black/5 cursor-text">
      <span className="text-[11px] uppercase tracking-wide text-black/40">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

export default function SearchPanel({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [tab, setTab] = useState<"homes" | "cars">("homes");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [checkin, setCheckin] = useState(initial?.checkin ?? "");
  const [checkout, setCheckout] = useState(initial?.checkout ?? "");
  const [adults, setAdults] = useState(initial?.adults ?? "2");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    q.set("destination", destination);
    if (checkin) q.set("checkin", checkin);
    if (checkout) q.set("checkout", checkout);
    q.set("adults", adults);
    router.push(`/search?${q.toString()}`);
  }

  return (
    <div className="bg-[#efeff3] rounded-3xl p-3 sm:p-4">
      <div className="flex gap-1 mb-3">
        <button
          type="button"
          onClick={() => setTab("cars")}
          className={`text-sm px-4 py-2 rounded-xl transition ${tab === "cars" ? "bg-white shadow-sm font-medium" : "text-black/55"}`}
        >
          Cars
        </button>
        <button
          type="button"
          onClick={() => setTab("homes")}
          className={`text-sm px-4 py-2 rounded-xl transition ${tab === "homes" ? "bg-accent-tint text-accent font-medium" : "text-black/55"}`}
        >
          Hotels
        </button>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-2 grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-1 sm:gap-2 items-stretch"
      >
        <Field label="Where">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="Oahu, Hawaii"
            className="w-full outline-none text-sm bg-transparent"
          />
        </Field>
        <Field label="Check-in">
          <input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            className="w-full outline-none text-sm text-black/70 bg-transparent"
          />
        </Field>
        <Field label="Check-out">
          <input
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            className="w-full outline-none text-sm text-black/70 bg-transparent"
          />
        </Field>
        <Field label="Guests">
          <select
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            className="w-full outline-none text-sm text-black/70 bg-transparent"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Adult{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="bg-accent text-white font-medium px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Update Search
        </button>
      </form>
    </div>
  );
}
