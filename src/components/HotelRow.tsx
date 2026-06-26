import Link from "next/link";
import Image from "next/image";
import CardCarousel from "@/components/CardCarousel";
import AmenityIcon from "@/components/AmenityIcon";
import SaveHeart from "@/components/SaveHeart";
import MemberNudge from "@/components/MemberNudge";
import type { CardHotel } from "@/lib/oahu";
import { hotelHref } from "@/lib/hotelUrl";
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
  compact = false,
  priority = false,
  awaitingDates = false,
}: {
  hotel: CardHotel;
  query?: string;
  price?: Price | null;
  loading?: boolean;
  compact?: boolean;
  priority?: boolean;
  awaitingDates?: boolean; // no dates chosen yet (city hub) → invite the visitor to pick dates, no fake price
}) {
  const href = `${hotelHref(hotel)}${query ? `?${query}` : ""}`;
  const rev = reviewLabel(hotel.rating ?? undefined);
  const amenities = hotel.amenities.slice(0, 2);
  const [s1, s2] = hotel.images.slice(1, 3);

  // Member discount — only present when the API sent `member` (logged-in users). Shows the public price +
  // the member price + savings; NEVER the net or the fee % (POSITIONING §1). Property fees are identical
  // for everyone, so they cancel out of the savings figure.
  // Only a "member deal" when the saving is meaningful (≥1% off). Otherwise net×1.15 landed at/within
  // rounding of SSP → show the normal "same price for everyone" block, never a "save $0 (0%)" badge.
  const memberSave = price?.member != null ? price.amount - price.member : 0;
  const memberPublic = price?.allIn ?? price?.amount ?? 0;
  const memberDeal =
    price?.member != null && memberPublic > 0 && memberSave / memberPublic >= 0.01
      ? {
          publicAllIn: price.allIn ?? price.amount,
          memberAllIn: price.member + (price.feesAtProperty ?? 0),
          save: memberSave,
          pct: Math.round((100 * memberSave) / memberPublic),
        }
      : null;

  return (
    <Link
      href={href}
      className={`group flex overflow-hidden rounded-[10px] border border-black/[0.1] bg-white transition-colors hover:border-black/30 ${
        compact ? "min-h-[11.5rem]" : "min-h-[14rem]"
      }`}
    >
      {/* photo collage: tall main (grows to fill card height) + 2 small under, flush to card edges */}
      <div className="w-[40%] sm:w-[42%] shrink-0 flex flex-col gap-1.5">
        <div className="relative flex-1 min-h-0 overflow-hidden bg-zinc-100">
          <CardCarousel images={hotel.images} alt={hotel.name} arrows={false} priority={priority} sizes="(max-width: 640px) 42vw, 320px" />
          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
            {hotel.popular ? (
              <span className="bg-accent text-white text-[0.65rem] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                Popular
              </span>
            ) : null}
            {hotel.propertyType && hotel.propertyType !== "Hotel" ? (
              <span className="bg-white/95 text-black/80 text-[0.65rem] font-semibold px-2 py-0.5 rounded-md shadow-sm">
                {hotel.propertyType}
              </span>
            ) : null}
          </div>
          <SaveHeart id={hotel.id} />
        </div>
        {(s1 || s2) ? (
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            {[s1, s2].map((src, i) => (
              <div key={i} className="relative h-[70px] sm:h-24 overflow-hidden bg-zinc-100">
                {src ? (
                  <Image
                    src={src}
                    alt={`${hotel.name} photo ${i + 2}`}
                    fill
                    sizes="(max-width: 640px) 21vw, 150px"
                    quality={65}
                    className="object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 min-w-0 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 font-bold leading-snug tracking-tight text-[1.02rem] sm:text-[1.12rem] text-black group-hover:text-accent transition-colors">
          {hotel.name}
        </h3>

        <p className="text-[0.8rem] text-black/60 line-clamp-1">
          {hotel.nearby ? (
            <span className="inline-flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-black/40">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {hotel.nearby}
            </span>
          ) : (
            [hotel.address, hotel.city].filter(Boolean).join(", ")
          )}
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
            memberDeal ? (
              <>
                <div className="text-[0.78rem] text-black/40">
                  <span className="line-through">{money(memberDeal.publicAllIn, price.currency)}</span> public
                </div>
                <div className="leading-tight">
                  <span className="font-bold tracking-tight text-[1.5rem] text-accent">
                    {money(Math.round(memberDeal.memberAllIn / price.nights), price.currency)}
                  </span>
                  <span className="text-[0.84rem] text-black/70">/night</span>
                </div>
                <div className="text-[0.84rem] text-black/80">{money(memberDeal.memberAllIn, price.currency)} total · all-in</div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-accent">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Member price · save {money(memberDeal.save, price.currency)} ({memberDeal.pct}%)
                </div>
              </>
            ) : (
              <>
                <div className="leading-tight">
                  <span className="font-bold tracking-tight text-[1.5rem] text-black">
                    {money(Math.round((price.allIn ?? price.amount) / price.nights), price.currency)}
                  </span>
                  <span className="text-[0.84rem] text-black/70">/night</span>
                </div>
                <div className="text-[0.84rem] text-black/80">{money(price.allIn ?? price.amount, price.currency)} total</div>
                <div className="text-[0.68rem] text-black/45">
                  All-in · taxes &amp; fees included
                  {price.feesAtProperty ? ` (incl. ${money(price.feesAtProperty, price.currency)} property fees)` : ""}
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-[0.68rem] font-medium text-accent">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Same price for everyone
                </div>
                <MemberNudge />
              </>
            )
          ) : loading ? (
            <span className="text-xs text-black/40">Checking price…</span>
          ) : awaitingDates ? (
            <div className="leading-tight">
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[0.98rem] font-semibold text-accent">
                See your price
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <div className="text-[0.68rem] text-black/45">All-in · same price for everyone</div>
            </div>
          ) : (
            <span className="text-xs text-black/40">Unavailable for these dates</span>
          )}
        </div>
      </div>
    </Link>
  );
}
