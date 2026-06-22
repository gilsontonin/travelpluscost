"use client";

import { useEffect, useState } from "react";
import VibeCard from "@/components/VibeCard";
import type { VibeHotel } from "@/lib/vibeSearch";

export default function VibeResults({
  query,
  checkin,
  checkout,
  adults,
}: {
  query: string;
  checkin?: string;
  checkout?: string;
  adults: number;
}) {
  const [hotels, setHotels] = useState<VibeHotel[] | null>(null);
  const [errored, setErrored] = useState(false);

  // Parent remounts this (keyed by query+dates) on each new search, so state resets naturally —
  // no need to setState synchronously in the effect (which the React lint rule forbids).
  useEffect(() => {
    let on = true;
    const p = new URLSearchParams({ q: query, adults: String(adults) });
    if (checkin) p.set("checkin", checkin);
    if (checkout) p.set("checkout", checkout);
    fetch(`/api/vibe?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!on) return;
        setHotels(d.hotels ?? []);
      })
      .catch(() => {
        if (!on) return;
        setErrored(true);
        setHotels([]);
      });
    return () => {
      on = false;
    };
  }, [query, checkin, checkout, adults]);

  if (hotels === null) {
    return (
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm text-black/55">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Reading the vibe of “<span className="text-black/80">{query}</span>”…
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
              <div className="aspect-[16/10] animate-pulse bg-black/[0.05]" />
              <div className="space-y-2 p-3.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-black/[0.06]" />
                <div className="h-3 w-full animate-pulse rounded bg-black/[0.05]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-black/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hotels.length) {
    return (
      <p className="py-16 text-center text-black/50">
        No vibe matches{errored ? " (something went wrong)" : ""} for “<span className="font-medium">{query}</span>”. Try
        describing the trip a little differently.
      </p>
    );
  }

  const cardQuery = new URLSearchParams({
    ...(checkin ? { checkin } : {}),
    ...(checkout ? { checkout } : {}),
    adults: String(adults),
  }).toString();

  return (
    <div>
      <p className="mb-3 text-sm text-black/55">
        {hotels.length} stays matched “<span className="text-black/80">{query}</span>” · one honest price, never based on
        your data.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {hotels.map((h, i) => (
          <VibeCard key={h.id} hotel={h} query={cardQuery} priority={i < 2} />
        ))}
      </div>
    </div>
  );
}
