import Link from "next/link";
import type { HotelCardData } from "@/lib/hotels";
import { money, reviewLabel } from "@/lib/format";

export default function HotelRow({ hotel, query }: { hotel: HotelCardData; query?: string }) {
  const href = `/hotel/${hotel.id}${query ? `?${query}` : ""}`;
  const rev = reviewLabel(hotel.rating);

  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition"
    >
      <div className="flex flex-col sm:flex-row">
        {/* image */}
        <div className="relative sm:w-72 shrink-0 aspect-[16/10] sm:aspect-auto bg-zinc-100">
          {hotel.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.image} alt={hotel.name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-black/30 text-sm">no photo</div>
          )}
          <span className="absolute top-3 right-3 bg-white/95 w-8 h-8 rounded-full grid place-items-center shadow-sm text-black/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </span>
        </div>

        {/* middle + price */}
        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight">{hotel.name}</h3>
            <p className="text-sm text-black/50 mt-0.5 line-clamp-1">
              {[hotel.address, hotel.city].filter(Boolean).join(", ")}
            </p>
            {hotel.stars ? <p className="text-sm text-black/60 mt-2">{hotel.stars}-star hotel</p> : null}
            {rev ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-2 py-1 rounded-md">{rev.score}</span>
                <span className="text-sm">
                  <span className="font-semibold">{rev.label}</span>
                  {hotel.reviewCount ? (
                    <span className="text-black/50"> · {hotel.reviewCount.toLocaleString()} reviews</span>
                  ) : null}
                </span>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 sm:w-44 sm:text-right flex sm:flex-col items-end justify-between sm:justify-start">
            {hotel.price ? (
              <>
                <div className="text-xl font-bold">
                  {money(hotel.price.perNight, hotel.price.currency)}
                  <span className="text-sm font-normal text-black/50"> nightly</span>
                </div>
                <div className="text-sm text-black/70">{money(hotel.price.amount, hotel.price.currency)} total</div>
                <div className="text-xs text-black/40">Total with taxes and fees</div>
                <div className="text-[11px] text-accent/80 mt-1">Same price for everyone</div>
              </>
            ) : (
              <span className="text-sm text-black/40">See prices</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
