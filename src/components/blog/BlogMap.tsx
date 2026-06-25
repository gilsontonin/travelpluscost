"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MapView from "@/components/MapView";
import type { CardHotel } from "@/lib/hotels";

// `::map <destination>` — the OTA "where are the hotels?" map: a real map (keyless CARTO tiles, reusing
// MapView) with a coral dot for each real stay, over an "explore on the interactive map" link. It's
// LAZY: the Leaflet JS + map tiles (~335 KiB) only load once the map scrolls within 400px of the
// viewport, so a below-the-fold map never costs initial-load performance. Falls back to the plain link
// when a market has too little geo data.
export default function BlogMap({ dest, hotels = [] }: { dest: string; hotels?: CardHotel[] }) {
  const href = `/search?destination=${encodeURIComponent(dest)}&adults=2`;
  const pts = hotels.filter((h) => h.lat != null && h.lng != null) as (CardHotel & { lat: number; lng: number })[];
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pts.length < 2 || show) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setShow(true); io.disconnect(); } },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pts.length, show]);

  if (pts.length < 2) {
    return (
      <Link href={href} className="my-6 flex items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent-tint/30 px-4 py-3.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/60">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zM9 3v15M15 6v15" /></svg>
        View {dest} stays on the map
      </Link>
    );
  }

  const lats = pts.map((h) => h.lat);
  const lngs = pts.map((h) => h.lng);
  const center: [number, number] = [lats.reduce((a, b) => a + b, 0) / pts.length, lngs.reduce((a, b) => a + b, 0) / pts.length];
  const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
  const zoom = span > 0.5 ? 10 : span > 0.2 ? 11 : span > 0.08 ? 12 : span > 0.03 ? 13 : 14;
  const markers = pts.map((h) => ({ lat: h.lat, lng: h.lng }));

  return (
    <div className="my-6" ref={ref}>
      {show ? (
        <MapView center={center} zoom={zoom} markers={markers} height={300} />
      ) : (
        <div className="animate-pulse rounded-lg border border-black/10 bg-zinc-100" style={{ height: 300 }} aria-hidden />
      )}
      <Link href={href} className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent-tint/30 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/60">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zM9 3v15M15 6v15" /></svg>
        Explore {pts.length} {dest} stays on the interactive map
      </Link>
    </div>
  );
}
