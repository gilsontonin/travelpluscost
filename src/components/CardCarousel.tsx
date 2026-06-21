"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

export default function CardCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);

  if (!images.length) {
    return <div className="absolute inset-0 grid place-items-center text-black/30 text-xs">no photo</div>;
  }

  const move = (dir: number) => setI((p) => (p + dir + images.length) % images.length);
  const arrow = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    move(dir);
  };

  return (
    <div
      className="absolute inset-0 group/car"
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 30) move(dx < 0 ? 1 : -1);
      }}
    >
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 ? (
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
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
