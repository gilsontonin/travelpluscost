"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { DirectoryHotel } from "@/lib/directory";
import { hotelHref } from "@/lib/hotelUrl";
import { money, reviewLabel } from "@/lib/format";
import { useHotelPrice } from "@/components/blog/BlogPriceProvider";
import CardCarousel from "@/components/CardCarousel";

// `::showcase <id>` … `::end` — the inventory-forward block. A BIG property card with a swipable photo
// gallery is shown FIRST (right under the heading), then the section's prose is faded under a small
// "read more" link. The text is there for SEO; the intent is to put the bookable room in front of the
// reader immediately instead of behind a wall of copy. SSP price = public, same for everyone.
export default function ShowcaseHotel({
  hotel,
  images,
  children,
}: {
  hotel: DirectoryHotel;
  images: string[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const href = hotelHref(hotel);
  const loc = [hotel.city, hotel.state].filter(Boolean).join(", ");
  const rev = reviewLabel(hotel.rating ?? undefined);
  const price = useHotelPrice(hotel.id);
  const gallery = images.length ? images : hotel.thumbnail ? [hotel.thumbnail] : [];

  return (
    <div className="my-6">
      {/* BIG card — swipable gallery + details, the whole card links to the property page */}
      <Link
        href={href}
        className="group block overflow-hidden rounded-2xl border border-black/[0.1] bg-white transition hover:border-black/30 hover:shadow-sm"
      >
        <div className="relative aspect-[16/10] bg-zinc-100">
          <CardCarousel
            images={gallery}
            alt={loc ? `${hotel.name} — hotel in ${loc}` : hotel.name}
            sizes="(max-width:768px) 100vw, 760px"
          />
          {hotel.rating != null ? (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 shadow-sm">
              <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-white">{hotel.rating.toFixed(1)}</span>
              {rev ? <span className="text-xs font-semibold text-black">{rev.label}</span> : null}
            </div>
          ) : null}
        </div>
        <div className="p-4">
          {hotel.stars ? <div className="text-xs text-black/45">{"★".repeat(Math.round(hotel.stars))}</div> : null}
          <div className="text-lg font-semibold leading-snug text-black">{hotel.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-black/55">
            {loc ? <span>{loc}</span> : null}
            {hotel.review_count ? <span className="text-black/40">· {hotel.review_count.toLocaleString()} reviews</span> : null}
          </div>
          {hotel.pros?.length ? (
            <p className="mt-1.5 line-clamp-1 text-xs text-black/55">
              <span className="font-semibold text-accent">Guests loved:</span> {hotel.pros.slice(0, 2).join(" · ")}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="leading-tight">
              {price ? (
                <>
                  <span className="text-xs text-black/45">from </span>
                  <span className="text-xl font-bold tracking-tight text-black">
                    {money(Math.round((price.allIn ?? price.amount) / price.nights), price.currency)}
                  </span>
                  <span className="text-xs text-black/55">/night</span>
                </>
              ) : (
                <span className="text-base font-semibold text-black">See your price</span>
              )}
              <div className="text-[0.68rem] text-black/45">All-in · same for everyone</div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition group-hover:opacity-90">
              See rooms
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </div>
        </div>
      </Link>

      {/* The prose — present for SEO, faded under a "read more" so the card stays the focus */}
      {children ? (
        <div className="mt-3">
          <div className={open ? "space-y-3" : "relative max-h-24 space-y-3 overflow-hidden"}>
            {children}
            {!open ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-1 text-sm font-medium text-accent hover:underline"
          >
            {open ? "Read less" : "Read more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
