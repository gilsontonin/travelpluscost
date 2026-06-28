"use client";

import { useEffect, useState, type ReactNode } from "react";
import MapView from "@/components/MapView";
import type { Neighborhood, Place } from "@/lib/neighborhood";

const ICON: Record<Place["icon"], ReactNode> = {
  sight: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  food: (
    <>
      <path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20" />
      <path d="M16 2a4 4 0 0 0-4 4v6h4m0-10v20" />
    </>
  ),
  transit: (
    <>
      <rect x="5" y="3" width="14" height="13" rx="2" />
      <path d="M5 11h14M8 19l-2 2M16 19l2 2" />
      <circle cx="8.5" cy="13.5" r="0.6" fill="currentColor" />
      <circle cx="15.5" cy="13.5" r="0.6" fill="currentColor" />
    </>
  ),
  air: <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9.3l-.9.9 5 3-2 2-2-.5-.7.7 2.5 2 2 2.5.7-.7-.5-2 2-2 3 5 .9-.9a1 1 0 0 0 .3-.9Z" />,
};

function label(p: Place, mode: "dist" | "drive") {
  const mi = `${p.distMi.toFixed(1)} mi`;
  if (mode === "drive" && p.driveMin) return `${p.driveMin} min drive · ${mi}`;
  return mi;
}

function Col({ title, places, mode }: { title: string; places: Place[]; mode: "dist" | "drive" }) {
  if (!places.length) return null;
  return (
    <div>
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-3">
        {places.map((p) => (
          <li key={`${p.name}-${p.lat}`} className="flex items-start gap-2.5 text-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-black/60"
            >
              {ICON[p.icon]}
            </svg>
            <span className="min-w-0">
              <span className="block font-medium leading-snug text-black/85">{p.name}</span>
              <span className="block text-xs text-black/55">{label(p, mode)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutNeighborhood({
  lat,
  lng,
  name,
  address,
  city,
}: {
  lat: number | null;
  lng: number | null;
  name?: string;
  address?: string;
  city?: string;
}) {
  const [data, setData] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let on = true;
    fetch(`/api/neighborhood?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d: Neighborhood) => {
        if (on) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (on) setLoading(false);
      });
    return () => {
      on = false;
    };
  }, [lat, lng]);

  if (lat == null || lng == null) return null;
  const hasData = !!data && (data.nearby.length > 0 || data.restaurants.length > 0 || data.gettingAround.length > 0);

  return (
    <section id="location" className="mt-10 scroll-mt-32">
      <h2 className="text-xl font-semibold mb-4">About the neighborhood</h2>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="mb-4 text-sm text-black/70">
            {name ? `${name} is` : "This property is"}
            {city ? ` in ${city}` : ""}.{hasData ? " Here's what's around it." : ""}
          </p>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-3">
              {[0, 1, 2].map((c) => (
                <div key={c} className="space-y-3">
                  <div className="h-4 w-24 rounded bg-black/[0.06]" />
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-8 rounded bg-black/[0.04]" />
                  ))}
                </div>
              ))}
            </div>
          ) : hasData ? (
            <div className="grid gap-6 sm:grid-cols-3">
              <Col title="What's nearby" places={data!.nearby} mode="dist" />
              <Col title="Getting around" places={data!.gettingAround} mode="drive" />
              <Col title="Restaurants" places={data!.restaurants} mode="drive" />
            </div>
          ) : (
            <p className="text-sm text-black/55">See the map and address for the exact location.</p>
          )}
          <p className="mt-4 text-xs text-black/60">Distances are straight-line; drive times via OpenStreetMap.</p>
        </div>

        <div>
          <MapView center={[lat, lng]} zoom={14} markers={[{ lat, lng }]} height={220} />
          {[address, city].filter(Boolean).length ? (
            <p className="mt-2 text-sm text-black/70">{[address, city].filter(Boolean).join(", ")}</p>
          ) : null}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent"
          >
            View in a map ↗
          </a>
        </div>
      </div>
    </section>
  );
}
