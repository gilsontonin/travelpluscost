"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DestinationField from "@/components/DestinationField";
import DateField from "@/components/DateField";
import GuestField from "@/components/GuestField";

// `::search <destination>` — a real, standalone honest-price search box embedded mid-post.
// Prefilled to the destination; collects dates + guests and routes to /search. The top converter:
// the reader searches without leaving the article. No URL coupling (safe in the static blog page).
export default function BlogSearch({ dest: initial }: { dest: string }) {
  const router = useRouter();
  const [dest, setDest] = useState(initial);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(2);
  const [, setRooms] = useState(1);

  const onSearch = () => {
    const q = new URLSearchParams();
    q.set("destination", dest.trim() || initial);
    if (checkin) q.set("checkin", checkin);
    if (checkout) q.set("checkout", checkout);
    q.set("adults", String(adults));
    router.push(`/search?${q.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-lg sm:p-5">
      <p className="mb-3 text-xl font-bold tracking-tight text-black">Search {initial} stays</p>
      <div className="flex flex-col gap-2.5">
        <DestinationField value={dest} onChange={setDest} />
        <div className="rounded-xl border border-black/15 bg-white">
          <DateField checkin={checkin} checkout={checkout} onChange={(ci, co) => { setCheckin(ci); setCheckout(co); }} />
        </div>
        <div className="rounded-xl border border-black/15 bg-white">
          <GuestField adults={adults} rooms={1} onChange={(a, r) => { setAdults(a); setRooms(r); }} />
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="w-full rounded-xl bg-accent px-7 py-3.5 text-[15px] font-semibold text-white transition hover:opacity-90"
        >
          Search
        </button>
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-black/50">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-accent">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        One honest price — the rate plus one small flat fee, the same for everyone, on any device.
      </p>
    </div>
  );
}
