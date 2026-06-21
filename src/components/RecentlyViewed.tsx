"use client";

import { useEffect, useState } from "react";
import HotelRail from "@/components/HotelRail";
import { getRecent } from "@/lib/recentlyViewed";
import type { RailHotel } from "@/lib/oahu";

// Reads the recently-viewed ids (localStorage, after mount to avoid hydration mismatch)
// and renders them as a rail using the lookup passed from the server.
export default function RecentlyViewed({ all }: { all: RailHotel[] }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setIds(getRecent());
  }, []);

  const map = new Map(all.map((h) => [h.id, h]));
  const recent = ids.map((id) => map.get(id)).filter((h): h is RailHotel => Boolean(h));
  if (recent.length < 2) return null;

  return <HotelRail title="Recently viewed" hotels={recent} />;
}
