import Link from "next/link";
import CardCarousel from "@/components/CardCarousel";
import AmenityIcon from "@/components/AmenityIcon";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";
import { money, reviewLabel } from "@/lib/format";

// Copied from the Hawaii Picnics HotelCardView layout: single tall image (~42%) on the left,
// content on the right. Cost-plus model, so the bottom is our own price block (no OTA buttons) and
// the whole card links to the property page.
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
  const amenities = hotel.amenities.slice(0, 2);

  return (
    <Link
      href={href}
      className="group flex overflow-hidden rounded-[10px] border border-black/[0.1] bg-white min-h-[15rem] transition-colors hover:border-black/30"
    >
      <div className="relative shrink-0 w-[46%] bg-zinc-100">
        <CardCarousel images={hotel.images} alt={hotel.name} sizes="(max-width: 640px) 46vw, 460px" />
        <span className="absolute top-2 right-2 z-10 bg-white/95 w-8 h-8 rounded-full grid place-items-center shadow-sm text-black/55 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4 min-w-0">
        <h3 className="line-clamp-2 font-bold leading-snug tracking-tight text-[1.02rem] sm:text-[1.12rem] text-black group-hover:text-accent transition-colors">
          {hotel.name}
        </h3>

        <p className="text-[0.8rem] text-black/55 line-clamp-1">
          {[hotel.address, hotel.city].filter(Boolean).join(", ")}
        </p>

        {amenities.length ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-black/65">
            {amenities.map((a) => (
              <span key={a} className="inline-flex items-center gap-1">
                <AmenityIcon name={a} className="w-3.5 h-3.5 text-black/40" />
                {a}
              </span>
            ))}
          </p>
        ) : null}

        {price?.refundable ? <p className="text-[0.8rem] font-semibold text-[#2e7d46]">Fully refundable</p> : null}

        {rev ? (
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#2e7d46] px-1.5 py-1 text-[0.8rem] font-bold leading-none tabular-nums text-white">
              {rev.score}
            </span>
            <span className="text-[0.78rem] text-black/60">
              <b className="text-black">{rev.label}</b>
              {hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()} reviews` : ""}
            </span>
          </div>
        ) : null}

        <div className="mt-auto pt-2.5 text-right">
          {price ? (
            <>
              <div className="leading-tight">
                <span className="font-bold tracking-tight text-[1.5rem] text-black">{money(price.perNight, price.currency)}</span>
                <span className="text-[0.84rem] text-black/70">/night</span>
              </div>
              <div className="text-[0.84rem] text-black/80">{money(price.amount, price.currency)} total</div>
              <div className="text-[0.68rem] text-black/45">Total with taxes and fees</div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-[0.68rem] font-medium text-accent">
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
    </Link>
  );
}
