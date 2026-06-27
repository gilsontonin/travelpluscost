"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DateField from "@/components/DateField";
import GuestField from "@/components/GuestField";

// Lets the guest change dates/occupancy on the property page (updates the URL query →
// RoomsPanel reads it via useSearchParams and re-fetches rates). No trip back to search.
export default function RoomDateBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const checkin = sp.get("checkin") ?? "";
  const checkout = sp.get("checkout") ?? "";
  const adults = parseInt(sp.get("adults") ?? "2", 10);
  const [rooms, setRooms] = useState(1);

  const update = (patch: Record<string, string>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-stretch gap-2 max-w-2xl rounded-2xl border border-black/[0.08] bg-card p-2 shadow-card">
      <div className="flex-1 min-w-[150px] bg-white rounded-xl border border-black/[0.08]">
        <DateField checkin={checkin} checkout={checkout} onChange={(ci, co) => update({ checkin: ci, checkout: co })} />
      </div>
      <div className="flex-1 min-w-[150px] bg-white rounded-xl border border-black/[0.08]">
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
  );
}
