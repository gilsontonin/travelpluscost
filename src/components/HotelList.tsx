import Image from "next/image";
import Link from "next/link";
import { reviewLabel } from "@/lib/format";
import { hotelHref } from "@/lib/hotelUrl";

// Accepts any object with these fields (CardHotel and RailHotel both satisfy it).
interface RailHotelLike {
  id: string;
  name: string;
  image: string;
  city: string;
  rating: number | null;
  reviewCount: number | null;
  propertyType: string;
}

// A vertical stack of large, photo-forward property cards (Expedia results style) — the inventory-first
// hero for blog "where to stay" posts. One big column on mobile (scroll down through stays), two on
// desktop. No stamped price (rates are live + per-date); a guest score + "See your price" instead.
export default function HotelList({
  title,
  subtitle,
  hotels,
  seeAllHref,
  limit = 6,
}: {
  title: string;
  subtitle?: string;
  hotels: RailHotelLike[];
  seeAllHref?: string;
  limit?: number;
}) {
  const shown = hotels.filter((h) => h.image).slice(0, limit);
  if (!shown.length) return null;
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-black/55">{subtitle}</p> : null}
        </div>
        {seeAllHref ? (
          <Link href={seeAllHref} className="shrink-0 text-sm font-medium text-accent hover:underline">
            See all
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.map((h) => {
          const rev = reviewLabel(h.rating ?? undefined);
          return (
            <Link
              key={h.id}
              href={hotelHref(h)}
              className="group block overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:border-black/25 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-zinc-100">
                <Image
                  src={h.image}
                  alt={h.city ? `${h.name} — hotel in ${h.city}` : h.name}
                  fill
                  sizes="(max-width:640px) 100vw, 360px"
                  className="object-cover"
                />
                {rev ? (
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 shadow-sm">
                    <span className="rounded bg-[#2e7d46] px-1.5 py-0.5 text-xs font-bold text-white">{rev.score}</span>
                    <span className="text-xs font-semibold text-black">{rev.label}</span>
                  </div>
                ) : null}
                {h.propertyType && h.propertyType !== "Hotel" ? (
                  <span className="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                    {h.propertyType}
                  </span>
                ) : null}
              </div>
              <div className="p-3.5">
                <div className="text-[15px] font-semibold leading-snug line-clamp-2 group-hover:text-accent">{h.name}</div>
                <div className="mt-0.5 text-sm text-black/55">
                  {h.city}
                  {h.reviewCount ? <span className="text-black/40"> · {h.reviewCount.toLocaleString()} reviews</span> : null}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white transition group-hover:opacity-90">
                    See your price
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span className="text-[11px] text-black/40">one flat fee</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
