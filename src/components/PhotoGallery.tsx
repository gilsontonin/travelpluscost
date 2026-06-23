"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PhotoGallery({
  images,
  name,
  backHref,
}: {
  images: string[];
  name: string;
  backHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0); // lightbox index
  const [hero, setHero] = useState(0); // hero carousel index
  // Preload current frame + neighbours so a swipe never waits on a download (no white flash).
  const [mounted, setMounted] = useState<Set<number>>(() => {
    const s = new Set([0]);
    if (images.length > 1) {
      s.add(1);
      s.add(images.length - 1);
    }
    return s;
  });
  const startX = useRef<number | null>(null);

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

  if (!images.length) return <div className="mt-3 h-[400px] sm:h-[440px] bg-zinc-100 sm:rounded-lg" />;

  const goHero = (i: number) => {
    const ni = Math.max(0, Math.min(images.length - 1, i));
    setHero(ni);
    setMounted((s) => {
      const n = new Set(s);
      n.add(ni);
      n.add((ni + 1) % images.length);
      n.add((ni - 1 + images.length) % images.length);
      return n;
    });
  };
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user dismissed */
    }
  };

  const dots = Math.min(5, images.length);
  const activeDot = images.length > 1 ? Math.round((hero / (images.length - 1)) * (dots - 1)) : 0;
  const mosaic = images.length >= 5;

  return (
    <>
      {/* desktop mosaic (Expedia grid) — 1 big + 4 small; the last tile opens the full gallery */}
      {mosaic ? (
        <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 mt-3 h-[440px] rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => show(0)}
            aria-label="Open photo 1"
            className="relative col-span-2 row-span-2 cursor-zoom-in group bg-zinc-100"
          >
            <Image src={images[0]} alt={`${name} photo 1`} fill priority sizes="(max-width: 1024px) 50vw, 560px" className="object-cover transition group-hover:brightness-95" />
          </button>
          {images.slice(1, 5).map((src, k) => (
            <button
              key={k}
              type="button"
              onClick={() => show(k + 1)}
              aria-label={`Open photo ${k + 2}`}
              className="relative cursor-zoom-in group bg-zinc-100"
            >
              <Image src={src} alt={`${name} photo ${k + 2}`} fill sizes="280px" className="object-cover transition group-hover:brightness-95" />
              {k === 3 ? (
                <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  {images.length}
                  {images.length > 5 ? "+" : ""}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {/* full-bleed hero carousel on mobile (and on desktop when too few photos for the mosaic) */}
      <div className={`-mx-4 sm:mx-0 mt-0 sm:mt-3${mosaic ? " sm:hidden" : ""}`}>
        <div
          className="relative w-full h-[400px] sm:h-[440px] bg-zinc-100 sm:rounded-lg overflow-hidden"
          onTouchStart={(e) => {
            startX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (startX.current === null) return;
            const dx = e.changedTouches[0].clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 30) goHero(hero + (dx < 0 ? 1 : -1));
          }}
        >
          {/* sliding track — both frames are visible mid-transition (one pushes the other out) */}
          <div className="flex h-full w-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${hero * 100}%)` }}>
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => show(hero)}
                aria-label="Open photo"
                tabIndex={i === hero ? 0 : -1}
                className="relative h-full w-full shrink-0 cursor-zoom-in"
              >
                {mounted.has(i) ? (
                  <Image src={src} alt={`${name} photo ${i + 1}`} fill priority={i === 0 && !mosaic} sizes="(max-width: 640px) 100vw, 1024px" className="object-cover" />
                ) : null}
              </button>
            ))}
          </div>

          {/* top overlay: back + share */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="Back to results"
                className="pointer-events-auto w-9 h-9 rounded-full bg-white/95 grid place-items-center shadow hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>
            ) : <span />}
            <button
              type="button"
              onClick={share}
              aria-label="Share"
              className="pointer-events-auto w-9 h-9 rounded-full bg-white/95 grid place-items-center shadow hover:bg-white text-black/70"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="m16 6-4-4-4 4" />
                <path d="M12 2v13" />
              </svg>
            </button>
          </div>

          {images.length > 1 ? (
            <>
              {/* arrows (desktop) */}
              <button
                type="button"
                onClick={() => goHero(hero - 1)}
                aria-label="Previous photo"
                className="hidden sm:grid absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 place-items-center shadow hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                onClick={() => goHero(hero + 1)}
                aria-label="Next photo"
                className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 place-items-center shadow hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
              </button>

              {/* dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 rounded-full px-2.5 py-1.5">
                {Array.from({ length: dots }).map((_, i) => (
                  <span key={i} className={`rounded-full transition-all ${i === activeDot ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-white/60"}`} />
                ))}
              </div>

              {/* photo count → opens lightbox */}
              <button
                type="button"
                onClick={() => show(hero)}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-black/70"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                {images.length}
              </button>
            </>
          ) : null}
        </div>
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
          <div className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-4 pb-6 select-none" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={prev} className="text-white/80 hover:text-white p-3 shrink-0" aria-label="Previous">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            {/* fixed image area — every photo is contained in the SAME box, so the layout never
                jumps as you arrow through portrait/landscape shots */}
            <div className="flex-1 h-full min-w-0 flex items-center justify-center">
              <img src={images[idx]} alt={`${name} photo ${idx + 1}`} className="max-h-full max-w-full object-contain rounded-lg" />
              {images.length > 1 ? (
                <>
                  <img src={images[(idx + 1) % images.length]} alt="" aria-hidden className="hidden" />
                  <img src={images[(idx - 1 + images.length) % images.length]} alt="" aria-hidden className="hidden" />
                </>
              ) : null}
            </div>
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
