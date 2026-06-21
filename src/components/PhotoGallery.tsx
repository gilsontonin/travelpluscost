"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function PhotoGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const show = useCallback((i: number) => {
    setIdx(i);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, next, prev]);

  const hero = images[0];
  if (!hero) return <div className="mt-3 h-[260px] sm:h-[420px] bg-zinc-100 rounded-lg" />;
  const under = images.slice(1, 3);

  return (
    <>
      <div className="relative mt-3 space-y-2">
        {/* main photo */}
        <button
          type="button"
          onClick={() => show(0)}
          className="relative block w-full h-64 sm:h-[420px] rounded-lg overflow-hidden cursor-zoom-in"
        >
          <Image src={hero} alt={name} fill priority sizes="(max-width: 640px) 100vw, 1024px" className="object-cover" />
        </button>

        {/* two smaller photos under */}
        {under.length ? (
          <div className="grid grid-cols-2 gap-2">
            {under.map((src, i) => (
              <button
                type="button"
                key={i}
                onClick={() => show(i + 1)}
                className="relative h-28 sm:h-44 rounded-lg overflow-hidden cursor-zoom-in"
              >
                <Image src={src} alt={`${name} photo ${i + 2}`} fill sizes="(max-width: 640px) 50vw, 512px" className="object-cover" />
                {/* last tile gets the "view all" overlay when there are more */}
                {i === under.length - 1 && images.length > 3 ? (
                  <span className="absolute inset-0 bg-black/45 grid place-items-center text-white text-sm font-medium">
                    +{images.length - 3} photos
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {images.length > 1 ? (
          <button
            type="button"
            onClick={() => show(0)}
            className="absolute top-3 right-3 bg-white/95 text-black text-sm font-medium px-3 py-1.5 rounded-md shadow-sm hover:bg-white"
          >
            View all {images.length} photos
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={close}>
          <div className="flex items-center justify-between text-white p-4 text-sm">
            <span>
              {idx + 1} / {images.length}
            </span>
            <button type="button" onClick={close} className="p-2 hover:opacity-80" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-6 select-none" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={prev} className="text-white/80 hover:text-white p-3 shrink-0" aria-label="Previous">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <img src={images[idx]} alt={`${name} photo ${idx + 1}`} className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg" />
            <button type="button" onClick={next} className="text-white/80 hover:text-white p-3 shrink-0" aria-label="Next">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
