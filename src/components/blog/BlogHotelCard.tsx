"use client";

import Link from "next/link";
import Image from "next/image";
import type { DirectoryHotel } from "@/lib/directory";
import { hotelHref } from "@/lib/hotelUrl";
import { money, reviewLabel } from "@/lib/format";
import { useHotelPrice, useStayDates } from "@/components/blog/BlogPriceProvider";

// Inline hotel card for blog posts — `::hotel <hotelId>`. Photo-forward (OTA-style), with a guest-score
// badge and a live "from $X/night · all-in" SSP fetched client-side via BlogPriceProvider (one batched
// call per page). Falls back to "See your price" when there's no near-term availability. SSP = the public
// price, the same for everyone — never the net cost or markup.
export default function BlogHotelCard({ hotel }: { hotel: DirectoryHotel }) {
  const { checkin, checkout } = useStayDates();
  // Link on the SAME dates the card was priced for, so the property page (and checkout) shows the exact
  // same number — not its own default-date reprice. Clean URL until the dates load (canonical stays clean).
  const href = checkin ? `${hotelHref(hotel)}?checkin=${checkin}&checkout=${checkout}&adults=2` : hotelHref(hotel);
  const loc = [hotel.city, hotel.state].filter(Boolean).join(", ");
  const rev = reviewLabel(hotel.rating ?? undefined);
  const price = useHotelPrice(hotel.id);
  return (
    <Link
      href={href}
      className="group my-6 block overflow-hidden rounded-2xl border border-black/[0.08] bg-card shadow-card transition hover:shadow-pop"
    >
      <div className="relative aspect-[16/10] bg-zinc-100">
        {hotel.thumbnail ? (
          <Image src={hotel.thumbnail} alt={loc ? `${hotel.name} — hotel in ${loc}` : hotel.name} fill sizes="(max-width:768px) 100vw, 720px" className="object-cover" />
        ) : null}
        {hotel.rating != null ? (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 shadow-sm">
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-white">{hotel.rating.toFixed(1)}</span>
            {rev ? <span className="text-xs font-semibold text-black">{rev.label}</span> : null}
          </div>
        ) : null}
        {hotel.property_type && hotel.property_type !== "Hotel" ? (
          <span className="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            {hotel.property_type}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        {hotel.stars ? <div className="text-xs text-black/45">{"★".repeat(Math.round(hotel.stars))}</div> : null}
        <div className="text-base font-semibold leading-snug text-black">{hotel.name}</div>
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
  );
}
