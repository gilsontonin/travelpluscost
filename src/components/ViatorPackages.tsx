"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import type { Activity } from "@/lib/viator";

// Reused on the hotel page (pass the hotel's lat/lng) and the home screen (no props → visitor geo).
// Cards deep-link to Viator (affiliate tracking already in the URL). Self-hides when there's nothing.
function dur(min: number | null): string {
  if (!min) return "";
  if (min >= 1440) { const d = Math.round(min / 1440); return `${d} day${d > 1 ? "s" : ""}`; }
  if (min >= 60) { const h = Math.floor(min / 60); const m = min % 60; return m ? `${h}h ${m}m` : `${h}h`; }
  return `${min}m`;
}

export default function ViatorPackages({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const [data, setData] = useState<{ activities: Activity[]; place: string | null } | null>(null);

  useEffect(() => {
    let on = true;
    const qs = lat != null && lng != null ? `?lat=${lat}&lng=${lng}&limit=10` : "?limit=12";
    fetch(`/api/activities${qs}`)
      .then((r) => r.json())
      .then((d) => { if (on) setData(d); })
      .catch(() => { if (on) setData({ activities: [], place: null }); });
    return () => { on = false; };
  }, [lat, lng]);

  if (!data || !data.activities.length) return null;
  const { activities, place } = data;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Things to do{place ? ` in ${place}` : ""}</h2>
      <p className="mt-0.5 mb-3 text-sm text-black/55">Top-rated tours &amp; experiences, booked with Viator.</p>
      <div className="flex gap-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scroll-pl-4 sm:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {activities.map((a, i) => (
          <a
            key={a.code}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`group shrink-0 w-60 snap-start${i === 0 ? " ms-4 sm:ms-0" : ""}${i === activities.length - 1 ? " me-4 sm:me-0" : ""}`}
          >
            <div className="relative h-40 overflow-hidden rounded-lg bg-zinc-100">
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-accent">{a.title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-black/60">
              {a.rating ? (
                <span className="inline-flex items-center gap-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-accent"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" /></svg>
                  <b className="text-black/75">{a.rating.toFixed(1)}</b>
                  {a.reviews ? <span>({a.reviews.toLocaleString()})</span> : null}
                </span>
              ) : null}
              {a.durationMin ? <span>· {dur(a.durationMin)}</span> : null}
            </div>
            {a.fromPrice ? <p className="mt-0.5 text-sm text-black/80">from <b>{money(a.fromPrice, a.currency)}</b></p> : null}
          </a>
        ))}
      </div>
    </section>
  );
}
