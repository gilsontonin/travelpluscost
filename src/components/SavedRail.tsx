"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authBrowser } from "@/lib/auth";
import { hotelHref } from "@/lib/hotelUrl";

interface SavedHotel {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  thumbnail: string | null;
  rating: number | null;
}

// "Your saved stays" rail on the member home. Per-user (client), so it stays out of the shared/ISR page.
// Renders nothing while loading or when empty — no empty-state clutter on the inventory-forward home.
export default function SavedRail() {
  const [hotels, setHotels] = useState<SavedHotel[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await authBrowser().auth.getSession();
      if (!data.session) {
        setHotels([]);
        return;
      }
      try {
        const r = await fetch("/api/saved-hotels?details=1");
        const j = await r.json();
        setHotels(Array.isArray(j.hotels) ? j.hotels : []);
      } catch {
        setHotels([]);
      }
    })();
  }, []);

  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Your saved stays</h2>
      <div className="flex gap-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {hotels.map((h) => (
          <Link
            key={h.id}
            href={hotelHref({ id: h.id, name: h.name, city: h.city ?? "" })}
            className="group shrink-0 w-56 snap-start"
          >
            <div className="relative h-36 w-56 rounded-lg overflow-hidden bg-zinc-100">
              {h.thumbnail ? (
                <Image src={h.thumbnail} alt={h.name} fill sizes="224px" className="object-cover transition-transform group-hover:scale-105" />
              ) : null}
            </div>
            <p className="mt-1.5 font-medium text-sm line-clamp-1">{h.name}</p>
            <p className="text-xs text-black/55 line-clamp-1">{[h.city, h.state].filter(Boolean).join(", ")}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
