import Link from "next/link";
import CardCarousel from "@/components/CardCarousel";
import AmenityIcon from "@/components/AmenityIcon";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";
import { money, reviewLabel } from "@/lib/format";

export default function HotelRow({
  hotel,
  query,
  price,
  loading,
}: {
  hotel: CardHotel;
  query?: string;
  price?: Price | null;
  loading?: boolean;
}) {
  const href = `/hotel/${hotel.id}${query ? `?${query}` : ""}`;
  const rev = reviewLabel(hotel.rating ?? undefined);
  const amenities = hotel.amenities.slice(0, 4);

  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg border border-black/[0.07] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-black/10 transition"
    >
      <div className="flex items-stretch">
        <div className="relative w-32 sm:w-72 shrink-0 bg-zinc-100 overflow-hidden">
          <CardCarousel images={hotel.images} alt={hotel.name} />
          <span className="absolute top-2 right-2 z-10 bg-white/95 w-7 h-7 rounded-full grid place-items-center shadow-sm text-black/55 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </span>
        </div>

        <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 min-h-[220px] sm:min-h-[200px]">
          <div className="min-w-0 flex flex-col">
            <h3 className="font-semibold text-[15px] sm:text-base leading-snug line-clamp-2 group-hover:text-accent transition-colors">
              {hotel.name}
            </h3>
            <p className="text-xs sm:text-sm text-black/50 mt-1 flex items-start gap-1 line-clamp-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{[hotel.address, hotel.city].filter(Boolean).join(", ")}</span>
            </p>

            {hotel.stars ? (
              <div className="mt-1.5 flex items-center gap-0.5 text-accent" aria-label={`${hotel.stars} star hotel`}>
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" />
                  </svg>
                ))}
              </div>
            ) : null}

            {amenities.length ? (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {amenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-black/55">
                    <AmenityIcon name={a} className="w-3.5 h-3.5 text-black/40" />
                    {a}
                  </span>
                ))}
              </div>
            ) : null}

            {rev ? (
              <div className="mt-auto pt-2 flex items-center gap-2">
                <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">{rev.score}</span>
                <span className="text-xs sm:text-sm">
                  <span className="font-semibold">{rev.label}</span>
                  {hotel.reviewCount ? (
                    <span className="text-black/50"> · {hotel.reviewCount.toLocaleString()} reviews</span>
                  ) : null}
                </span>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 sm:w-44 text-right mt-auto sm:mt-0 sm:self-end">
            {price ? (
              <>
                <div className="text-lg sm:text-2xl font-bold leading-tight">
                  {money(price.perNight, price.currency)}
                  <span className="text-xs sm:text-sm font-normal text-black/50"> /night</span>
                </div>
                <div className="text-xs sm:text-sm text-black/70">{money(price.amount, price.currency)} total</div>
                <div className="text-[10px] sm:text-xs text-black/40">includes taxes &amp; fees</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-accent font-medium">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Same price for everyone
                </div>
              </>
            ) : loading ? (
              <span className="text-xs text-black/40">Checking price…</span>
            ) : (
              <span className="text-xs text-black/40">Unavailable for these dates</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
