import Link from "next/link";
import Image from "next/image";
import type { DirectoryHotel } from "@/lib/directory";
import { hotelHref } from "@/lib/hotelUrl";
import { reviewLabel } from "@/lib/format";

// Inline hotel card for blog posts — `::hotel <hotelId>`. Photo-forward (OTA-style), with a prominent
// guest-score badge and a "See your price" CTA to the live, honest rate. No stamped price: rates are
// live and per-date, and a number on the card edges toward the surveillance-pricing gimmicks we reject.
export default function BlogHotelCard({ hotel }: { hotel: DirectoryHotel }) {
  const href = hotelHref(hotel);
  const loc = [hotel.city, hotel.state].filter(Boolean).join(", ");
  const rev = reviewLabel(hotel.rating ?? undefined);
  return (
    <Link
      href={href}
      className="group my-6 block overflow-hidden rounded-2xl border border-black/[0.1] bg-white transition hover:border-black/30 hover:shadow-sm"
    >
      <div className="relative aspect-[16/10] bg-zinc-100">
        {hotel.thumbnail ? (
          <Image src={hotel.thumbnail} alt={hotel.name} fill sizes="(max-width:768px) 100vw, 720px" className="object-cover" />
        ) : null}
        {hotel.rating != null ? (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 shadow-sm">
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-white">{hotel.rating.toFixed(1)}</span>
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
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition group-hover:opacity-90">
            See your price
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
          <span className="text-xs text-black/45">one flat fee · same for everyone</span>
        </div>
      </div>
    </Link>
  );
}
