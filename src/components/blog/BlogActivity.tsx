"use client";

import { useEffect, useState } from "react";
import type { Activity } from "@/lib/viator";
import { ActivityCard } from "@/components/ViatorPackages";

// Per-section Viator offer(s) — `::activity <City> | <topic>`. Pulls 1–2 quality (>=4.5*) tours from the
// city pool whose title matches the topic (swamp, ghost, garden district, cooking…), so each relevant H2
// can carry a real, on-topic, bookable offer. Self-hides when nothing matches — we never force a card.
export default function BlogActivity({ lat, lng, q }: { lat?: number | null; lng?: number | null; q: string }) {
  const [acts, setActs] = useState<Activity[] | null>(null);
  useEffect(() => {
    let on = true;
    const params = new URLSearchParams({ q, limit: "2" });
    if (lat != null && lng != null) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    fetch(`/api/activities?${params}`)
      .then((r) => r.json())
      .then((d: { activities?: Activity[] }) => { if (on) setActs(d.activities ?? []); })
      .catch(() => { if (on) setActs([]); });
    return () => { on = false; };
  }, [lat, lng, q]);

  if (!acts || !acts.length) return null;
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {acts.map((a) => (
        <ActivityCard key={a.code} a={a} />
      ))}
    </div>
  );
}
