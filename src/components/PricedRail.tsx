"use client";

import { useEffect, useState } from "react";
import HotelRail from "@/components/HotelRail";
import type { Price } from "@/lib/rates";

interface RailHotelLike {
  id: string;
  name: string;
  image: string;
  city: string;
  rating: number | null;
  reviewCount: number | null;
  propertyType: string;
}

// Client wrapper around HotelRail: renders the rail immediately (static, fast), then fetches live
// "from" SSP from /api/prices and fills the price in a beat later — same client-fetch pattern as
// NearbyRail/SeasonalRail, so the home shell stays static and we don't depend on a build-time rates call.
export default function PricedRail(props: {
  title: string;
  subtitle?: string;
  hotels: RailHotelLike[];
  seeAllHref?: string;
}) {
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const idsKey = props.hotels.map((h) => h.id).join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (!ids.length) return;
    let on = true;
    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: ids, adults: 2 }),
    })
      .then((r) => r.json())
      .then((d: { prices?: Record<string, Price> }) => {
        if (on && d.prices) setPrices(d.prices);
      })
      .catch(() => {
        /* no prices → cards just show "See your price" via the property page */
      });
    return () => {
      on = false;
    };
  }, [idsKey]);

  return <HotelRail {...props} prices={prices} />;
}
