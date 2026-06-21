import Link from "next/link";
import Image from "next/image";
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
  const amenities = hotel.amenities.slice(0, 3);
  const [main, s1, s2] = hotel.images;

  return (
    <Link
      href={href}
      className="group block bg-white border border-black/[0.08] rounded-lg overflow-hidden hover:shadow-[0_4px_18px_rgba(0,0,0,0.08)] hover:border-black/15 transition"
    >
      <div className="flex gap-3 p-3">
        {/* photo collage: 1 main + 2 small under (Expedia layout) */}
        <div className="w-36 sm:w-64 shrink-0">
          <div className="relative w-full h-28 sm:h-44 rounded-md overflow-hidden bg-zinc-100">
            {main ? (
              <Image src={main} alt={hotel.name} fill sizes="(max-width: 640px) 144px, 256px" className="object-cover" />
            ) : null}
          </div>
          {(s1 || s2) ? (
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {[s1, s2].map((src, i) => (
                <div key={i} className="relative h-14 sm:h-[76px] rounded-md overflow-hidden bg-zinc-100">
                  {src ? (
                    <Image
                      src={src}
                      alt={`${hotel.name} photo ${i + 2}`}
                      fill
                      sizes="(max-width: 640px) 72px, 128px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="font-semibold text-base sm:text-[17px] leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {hotel.name}
          </h3>
          <p className="text-xs sm:text-sm text-black/55 mt-1 flex items-start gap-1 line-clamp-1">
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
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-black/60">
                  <AmenityIcon name={a} className="w-3.5 h-3.5 text-black/45" />
                  {a}
                </span>
              ))}
            </div>
          ) : null}

          {price?.refundable ? (
            <p className="mt-1.5 text-xs sm:text-sm text-[#1a7a4c] font-medium">Fully refundable</p>
          ) : null}

          {/* bottom: rating (left) + price (right) */}
          <div className="mt-auto pt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5">
            {rev ? (
              <div className="flex items-center gap-2">
                <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">{rev.score}</span>
                <span className="text-xs sm:text-sm leading-tight">
                  <span className="font-semibold">{rev.label}</span>
                  {hotel.reviewCount ? (
                    <span className="block sm:inline text-black/50"> {hotel.reviewCount.toLocaleString()} reviews</span>
                  ) : null}
                </span>
              </div>
            ) : (
              <span />
            )}

            <div className="text-left sm:text-right shrink-0">
              {price ? (
                <>
                  <div className="text-lg sm:text-xl font-bold leading-tight">
                    {money(price.perNight, price.currency)}
                    <span className="text-xs font-normal text-black/50"> nightly</span>
                  </div>
                  <div className="text-xs sm:text-sm text-black/70">{money(price.amount, price.currency)} total</div>
                  <div className="text-[10px] sm:text-xs text-black/40">Total with taxes and fees</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-accent font-medium">
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
      </div>
    </Link>
  );
}
