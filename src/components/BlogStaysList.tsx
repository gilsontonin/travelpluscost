"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HotelRow from "@/components/HotelRow";
import type { CardHotel } from "@/lib/hotels";
import type { Price } from "@/lib/rates";
import { fromDate } from "@/lib/fromDate";

// Blog "stays" list — renders the REAL search-results card (HotelRow) so the blog inventory looks
// exactly like /search, then fetches live "from" SSP from /api/prices client-side and shows it on
// each card. Isolated to the blog; reuses HotelRow as-is (no changes to search or the home page).
export default function BlogStaysList({
  title,
  subtitle,
  hotels,
  seeAllHref,
  limit = 6,
}: {
  title: string;
  subtitle?: string;
  hotels: CardHotel[];
  seeAllHref?: string;
  limit?: number;
}) {
  const shown = hotels.filter((h) => h.image).slice(0, limit);
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const idsKey = shown.map((h) => h.id).join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (!ids.length) return;
    let on = true;
    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: ids, adults: 2, ...fromDate() }),
    })
      .then((r) => r.json())
      .then((d: { prices?: Record<string, Price> }) => {
        if (on && d.prices) setPrices(d.prices);
      })
      .catch(() => {
        /* no prices → cards show "See your price" → the property page */
      });
    return () => {
      on = false;
    };
  }, [idsKey]);

  if (!shown.length) return null;
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-black/55">{subtitle}</p> : null}
        </div>
        {seeAllHref ? (
          <Link href={seeAllHref} className="shrink-0 text-sm font-medium text-accent hover:underline">
            See all
          </Link>
        ) : null}
      </div>

      <div className="space-y-3">
        {shown.map((h, i) => {
          const price = prices[h.id];
          return <HotelRow key={h.id} hotel={h} price={price ?? null} awaitingDates={!price} priority={i === 0} />;
        })}
      </div>
    </section>
  );
}
