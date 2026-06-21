"use client";

import { useEffect, useState } from "react";
import HotelRow from "./HotelRow";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";

export default function ResultsList({
  hotels,
  checkin,
  checkout,
  adults,
}: {
  hotels: CardHotel[];
  checkin?: string;
  checkout?: string;
  adults: number;
}) {
  const [prices, setPrices] = useState<Record<string, Price> | null>(null);

  useEffect(() => {
    let on = true;
    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: hotels.map((h) => h.id), checkin, checkout, adults }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (on) setPrices(d.prices ?? {});
      })
      .catch(() => {
        if (on) setPrices({});
      });
    return () => {
      on = false;
    };
  }, [hotels, checkin, checkout, adults]);

  const cardQuery = new URLSearchParams({
    ...(checkin ? { checkin } : {}),
    ...(checkout ? { checkout } : {}),
    adults: String(adults),
  }).toString();

  return (
    <div className="space-y-4">
      {hotels.map((h) => (
        <HotelRow key={h.id} hotel={h} query={cardQuery} price={prices?.[h.id] ?? null} loading={prices === null} />
      ))}
    </div>
  );
}
