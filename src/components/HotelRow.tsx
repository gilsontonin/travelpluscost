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
      className="group block bg-white border border-black/[0.1] rounded-lg overflow-hidden hover:shadow-[0_4px_18px_rgba(0,0,0,0.08)] transition"
    >
      <div className="flex gap-3 sm:gap-4 p-3">
        {/* photo collage: 1 tall PORTRAIT main + 2 small square under (Expedia layout) */}
        <div className="w-[36%] max-w-[210px] sm:w-60 shrink-0">
          <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100">
            {main ? (
              <Image src={main} alt={hotel.name} fill sizes="(max-width: 640px) 36vw, 240px" className="object-cover" />
            ) : null}
          </div>
          {(s1 || s2) ? (
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {[s1, s2].map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                  {src ? (
                    <Image
                      src={src}
                      alt={`${hotel.name} photo ${i + 2}`}
                      fill
                      sizes="(max-width: 640px) 18vw, 116px"
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
          <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {hotel.name}
          </h3>
          <p className="text-sm text-black/70 mt-1 line-clamp-1">
            {[hotel.address, hotel.city].filter(Boolean).join(", ")}
          </p>

          {amenities.length ? (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-black/70">
                  <AmenityIcon name={a} className="w-4 h-4 text-black/50" />
                  {a}
                </span>
              ))}
            </div>
          ) : null}

          {price?.refundable ? (
            <p className="mt-2 text-sm text-[#1a7a4c] font-medium">Fully refundable</p>
          ) : null}

          {rev ? (
            <div className="mt-auto pt-2 flex items-center gap-2">
              <span className="bg-[#1a7a4c] text-white text-sm font-bold px-2 py-1 rounded-md leading-none">{rev.score}</span>
              <div className="leading-tight">
                <span className="block font-semibold text-sm">{rev.label}</span>
                {hotel.reviewCount ? (
                  <span className="block text-xs text-black/50">{hotel.reviewCount.toLocaleString()} reviews</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className={`text-right ${rev ? "mt-2" : "mt-auto pt-2"}`}>
            {price ? (
              <>
                <div className="text-xl sm:text-2xl font-bold leading-tight">
                  {money(price.perNight, price.currency)}
                  <span className="text-xs sm:text-sm font-normal text-black/60"> nightly</span>
                </div>
                <div className="text-sm text-black/80 font-medium">{money(price.amount, price.currency)} total</div>
                <div className="text-[11px] text-black/45">Total with taxes and fees</div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-accent font-medium">
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
