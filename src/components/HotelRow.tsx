import Link from "next/link";
import CardCarousel from "@/components/CardCarousel";
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

  return (
    <Link
      href={href}
      className="block bg-white rounded-lg border border-black/5 overflow-hidden hover:shadow-md transition"
    >
      <div className="flex items-stretch">
        <div className="relative w-36 sm:w-72 shrink-0 bg-zinc-100 overflow-hidden">
          <CardCarousel images={hotel.images} alt={hotel.name} />
          <span className="absolute top-2 right-2 z-10 bg-white/95 w-7 h-7 rounded-full grid place-items-center shadow-sm text-black/60 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </span>
        </div>

        <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 min-h-[210px] sm:min-h-[184px]">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug line-clamp-2 sm:line-clamp-1">{hotel.name}</h3>
            <p className="text-sm text-black/50 mt-0.5 line-clamp-1">
              {[hotel.address, hotel.city].filter(Boolean).join(", ")}
            </p>
            {hotel.stars ? <p className="text-xs text-black/55 mt-1">{hotel.stars}-star hotel</p> : null}
            {rev ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">{rev.score}</span>
                <span className="text-xs sm:text-sm">
                  <span className="font-semibold">{rev.label}</span>
                  {hotel.reviewCount ? <span className="text-black/50"> · {hotel.reviewCount.toLocaleString()} reviews</span> : null}
                </span>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 sm:w-44 text-right mt-auto sm:mt-0">
            {price ? (
              <>
                <div className="text-base sm:text-xl font-bold leading-tight">
                  {money(price.perNight, price.currency)}
                  <span className="text-xs sm:text-sm font-normal text-black/50"> nightly</span>
                </div>
                <div className="text-xs sm:text-sm text-black/70">{money(price.amount, price.currency)} total</div>
                <div className="text-[10px] sm:text-xs text-black/40">Total with taxes and fees</div>
                <div className="text-[10px] sm:text-[11px] text-accent/80 mt-0.5">Same price for everyone</div>
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
