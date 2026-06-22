"use client";

import { useEffect, useState } from "react";
import HotelRail from "@/components/HotelRail";
import type { CardHotel } from "@/lib/hotels";

// Contextual "Stays near you" rail — fetches geo-based picks from /api/nearby (Netlify geo).
// Renders nothing until it has results, so the static home shell isn't affected and there's no
// empty placeholder when geo is unavailable (dev, non-US, etc.).
type Nearby = { cards: CardHotel[]; label: string; subtitle?: string };

export default function NearbyRail() {
  const [data, setData] = useState<Nearby | null>(null);

  useEffect(() => {
    let on = true;
    fetch("/api/nearby")
      .then((r) => r.json())
      .then((d: Nearby) => {
        if (on && d.cards?.length) setData(d);
      })
      .catch(() => {
        /* no geo / failed → rail stays hidden */
      });
    return () => {
      on = false;
    };
  }, []);

  if (!data) return null;
  return <HotelRail title={data.label} subtitle={data.subtitle} hotels={data.cards} />;
}
