"use client";

import { useState } from "react";
import DateField from "@/components/DateField";
import GuestField from "@/components/GuestField";
import { useStay } from "@/lib/useStay";

// Lets the guest change dates/occupancy on the property page. Writes via useStay (history.replaceState,
// not router navigation) → RoomsPanel re-prices instantly with no scroll-jump back to the top.
export default function RoomDateBar() {
  const { checkin, checkout, adults: adultsStr, update } = useStay();
  const adults = parseInt(adultsStr || "2", 10);
  const [rooms, setRooms] = useState(1);

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
