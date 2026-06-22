"use client";

import { useEffect, useState } from "react";
import HotelRail from "@/components/HotelRail";
import type { CardHotel } from "@/lib/hotels";

// Seasonal featured rail — title + picks swap by date (server computes the current season).
// Self-hides until it has results, so the static home shell is unaffected.
type Seasonal = { cards: CardHotel[]; title: string; subtitle?: string };

export default function SeasonalRail() {
  const [data, setData] = useState<Seasonal | null>(null);

  useEffect(() => {
    let on = true;
    fetch("/api/seasonal")
      .then((r) => r.json())
      .then((d: Seasonal) => {
        if (on && d.cards?.length) setData(d);
      })
      .catch(() => {
        /* failed → rail stays hidden */
      });
    return () => {
      on = false;
    };
  }, []);

  if (!data) return null;
  return <HotelRail title={data.title} subtitle={data.subtitle} hotels={data.cards} />;
}
