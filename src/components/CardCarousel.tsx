"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Native scroll-snap carousel: full finger-drag control (stop mid-swipe, snaps on release).
// Routes every photo through next/image so a card thumbnail downloads ~30 KB, not the original.
export default function CardCarousel({
  images,
  alt,
  sizes = "(max-width: 640px) 50vw, 288px",
  arrows = true,
  priority = false,
}: {
  images: string[];
  alt: string;
  sizes?: string;
  arrows?: boolean;
  priority?: boolean; // true for the first above-the-fold card → its lead image is the LCP
}) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  if (!images.length) {
    return <div className="absolute inset-0 grid place-items-center text-black/30 text-xs">no photo</div>;
  }

  const onScroll = () => {
    const el = ref.current;
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth));
  };
  const arrow = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="absolute inset-0 overflow-hidden group/car">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, idx) => (
          <div key={idx} className="relative h-full w-full shrink-0 snap-start">
            <Image src={src} alt={alt} fill sizes={sizes} quality={65} priority={priority && idx === 0} className="object-cover" />
          </div>
        ))}
      </div>

      {images.length > 1 && arrows ? (
        <>
          <button
            type="button"
            onClick={(e) => arrow(e, -1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-black grid place-items-center shadow opacity-100 sm:opacity-0 sm:group-hover/car:opacity-100 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => arrow(e, 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-black grid place-items-center shadow opacity-100 sm:opacity-0 sm:group-hover/car:opacity-100 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}

      {images.length > 1 ? (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
          {images.slice(0, 8).map((_, idx) => (
            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
