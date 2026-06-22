"use client";

import { useEffect, useRef, useState } from "react";

// Curated example "vibes" — a static cycling list (no AI/model cost). Shared by the home pill and
// the header search entry so they show the same rotation.
export const SAMPLE_VIBES = [
  "romantic beachfront resort in Maui with ocean views",
  "budget hotel walking distance to Times Square",
  "pet-friendly cabin in the Smoky Mountains",
  "adults-only spa retreat in Sedona",
  "family resort with a water park near Orlando",
  "boutique hotel in walkable downtown Charleston",
  "ski-in, ski-out lodge in Aspen",
  "quiet oceanfront inn on the Oregon coast",
];

// Typewriter: types a phrase, pauses, erases, types the next — looping. `phraseAt()` returns the
// phrase currently being shown (for "run this search" on tap).
export function useVibeTypewriter(phrases: string[] = SAMPLE_VIBES) {
  const [typed, setTyped] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = phrases[idx.current % phrases.length];
      if (!deleting) {
        char++;
        setTyped(full.slice(0, char));
        if (char === full.length) { deleting = true; timer = setTimeout(tick, 1900); return; }
        timer = setTimeout(tick, 42);
      } else {
        char--;
        setTyped(full.slice(0, char));
        if (char <= 0) { deleting = false; idx.current++; timer = setTimeout(tick, 350); return; }
        timer = setTimeout(tick, 22);
      }
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [phrases]);
  return { typed, phraseAt: () => phrases[idx.current % phrases.length] };
}
