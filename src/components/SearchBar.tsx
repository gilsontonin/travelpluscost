"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Initial = { destination?: string; checkin?: string; checkout?: string; adults?: string };

export default function SearchBar({ initial }: { initial?: Initial }) {
  const router = useRouter();
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
    <form
      onSubmit={submit}
      className="w-full bg-white rounded-2xl shadow-lg border border-black/5 p-2 flex flex-col sm:flex-row gap-2"
    >
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        required
        placeholder="Where to? (e.g. Las Vegas)"
        className="flex-1 px-4 py-3 rounded-xl outline-none"
      />
      <input
        type="date"
        value={checkin}
        onChange={(e) => setCheckin(e.target.value)}
        className="px-3 py-3 rounded-xl outline-none text-black/70"
      />
      <input
        type="date"
        value={checkout}
        onChange={(e) => setCheckout(e.target.value)}
        className="px-3 py-3 rounded-xl outline-none text-black/70"
      />
      <select
        value={adults}
        onChange={(e) => setAdults(e.target.value)}
        className="px-3 py-3 rounded-xl outline-none text-black/70"
      >
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n} guest{n > 1 ? "s" : ""}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-accent text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition"
      >
        Search
      </button>
    </form>
  );
}
