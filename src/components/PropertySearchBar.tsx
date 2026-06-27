"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DestinationField from "@/components/DestinationField";
import DateField from "@/components/DateField";
import GuestField from "@/components/GuestField";
import DateQuickPicks from "@/components/DateQuickPicks";

// Property-page search bar (Expedia-style): Where to (prefilled with THIS hotel) · Dates · Travelers · Search.
// Date/guest edits update the URL params live, so RoomsPanel re-prices instantly. Search jumps to the rooms
// when the destination is unchanged, or runs a fresh search if the guest typed a different place.
export default function PropertySearchBar({ hotelName }: { hotelName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const checkin = sp.get("checkin") ?? "";
  const checkout = sp.get("checkout") ?? "";
  const adults = parseInt(sp.get("adults") ?? "2", 10);
  const [dest, setDest] = useState(hotelName);
  const [rooms, setRooms] = useState(1);

  const update = (patch: Record<string, string>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const onSearch = () => {
    const d = dest.trim();
    if (d && d !== hotelName) {
      const q = new URLSearchParams();
      if (checkin) q.set("checkin", checkin);
      if (checkout) q.set("checkout", checkout);
      q.set("adults", String(adults));
      q.set("destination", d);
      router.push(`/search?${q.toString()}`);
    } else {
      document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-card p-3 shadow-card sm:p-3.5">
      {/* label + quick-pick chips — inside the card so the fields read as one search widget, not loose boxes */}
      <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1.5">
        <span className="text-sm font-semibold text-black">Choose dates to view prices</span>
        <DateQuickPicks compact />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="min-w-0 sm:flex-[1.3]">
          <DestinationField value={dest} onChange={setDest} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <div className="min-w-0 rounded-xl border border-black/15 bg-white sm:flex-1">
            <DateField checkin={checkin} checkout={checkout} onChange={(ci, co) => update({ checkin: ci, checkout: co })} />
          </div>
          <div className="min-w-0 rounded-xl border border-black/15 bg-white sm:flex-1">
            <GuestField
              adults={adults}
              rooms={rooms}
              onChange={(a, r) => {
                setRooms(r);
                update({ adults: String(a) });
              }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="rounded-full bg-accent px-7 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
        >
          Search
        </button>
      </div>
    </div>
  );
}
