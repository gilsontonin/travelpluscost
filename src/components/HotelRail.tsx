import Image from "next/image";
import Link from "next/link";
import { reviewLabel } from "@/lib/format";

// A titled horizontal scroller of compact hotel cards (Expedia-style home rail).
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

export default function HotelRail({
  title,
  subtitle,
  hotels,
  seeAllHref,
}: {
  title: string;
  subtitle?: string;
  hotels: RailHotelLike[];
  seeAllHref?: string;
}) {
  if (!hotels.length) return null;
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle ? <p className="text-sm text-black/55 mt-0.5">{subtitle}</p> : null}
        </div>
        {seeAllHref ? (
          <Link href={seeAllHref} className="text-sm font-medium text-accent shrink-0 hover:underline">
            See all
          </Link>
        ) : null}
      </div>

      <div className="flex gap-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {hotels.map((h) => {
          const rev = reviewLabel(h.rating ?? undefined);
          return (
            <Link key={h.id} href={`/hotel/${h.id}`} className="group shrink-0 w-52 snap-start">
              <div className="relative h-40 rounded-lg overflow-hidden bg-zinc-100">
                <Image src={h.image} alt={h.name} fill sizes="208px" className="object-cover" />
                {h.propertyType && h.propertyType !== "Hotel" ? (
                  <span className="absolute top-2 left-2 bg-white/95 text-black/80 text-[0.65rem] font-semibold px-2 py-0.5 rounded-md shadow-sm">
                    {h.propertyType}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {h.name}
              </p>
              {h.city ? <p className="text-xs text-black/50 mt-0.5">{h.city}</p> : null}
              {rev ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="bg-[#2e7d46] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">{rev.score}</span>
                  <span className="text-xs text-black/60">
                    <b className="text-black">{rev.label}</b>
                    {h.reviewCount ? ` · ${h.reviewCount.toLocaleString()}` : ""}
                  </span>
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
