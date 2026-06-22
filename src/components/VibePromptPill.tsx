"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// KAYAK-style animated suggestion pill: types out an example "vibe", pauses, erases, types the next.
// Pure client-side — a curated cycling list, no AI/model cost. Tapping runs that vibe search.
const SAMPLE_VIBES = [
  "romantic beachfront resort in Maui with ocean views",
  "budget hotel walking distance to Times Square",
  "pet-friendly cabin in the Smoky Mountains",
  "adults-only spa retreat in Sedona",
  "family resort with a water park near Orlando",
  "boutique hotel in walkable downtown Charleston",
  "ski-in, ski-out lodge in Aspen",
  "quiet oceanfront inn on the Oregon coast",
];

export default function VibePromptPill() {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = SAMPLE_VIBES[idx.current % SAMPLE_VIBES.length];
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
  }, []);

  const run = () => {
    const full = SAMPLE_VIBES[idx.current % SAMPLE_VIBES.length];
    router.push(`/search?vibe=${encodeURIComponent(full)}&adults=2`);
  };

  return (
    <div className="mt-3 flex justify-center">
      <button
        type="button"
        onClick={run}
        aria-label="Try search by vibe"
        className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-accent/30 bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-accent/60 hover:shadow-md active:scale-[0.99]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
          <path d="m12 2 1.9 5.8L19.5 9l-4.6 3.8L16.4 19 12 15.5 7.6 19l1.5-6.2L4.5 9l5.6-1.2z" />
        </svg>
        <span className="min-w-0 truncate text-sm text-black/70">
          <span className="font-medium text-black/45">Search by vibe: </span>
          {typed}
          <span className="ml-0.5 inline-block animate-pulse font-normal text-accent">|</span>
        </span>
      </button>
    </div>
  );
}
