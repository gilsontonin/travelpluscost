import Image from "next/image";
import Link from "next/link";
import { reviewLabel } from "@/lib/format";
import { hotelHref } from "@/lib/hotelUrl";

// Compact, price-free hotel card for grid layouts (city hub pages, "browse" surfaces).
// No live rates — the hub has no chosen dates — so the whole card links to the property page
// where the visitor picks dates and sees the all-in price. Satisfies the RailHotelLike shape.
interface CardLike {
  id: string;
  name: string;
  image: string;
  city: string;
  rating: number | null;
  reviewCount: number | null;
  propertyType: string;
}

export default function HotelGridCard({ hotel, priority = false }: { hotel: CardLike; priority?: boolean }) {
  const rev = reviewLabel(hotel.rating ?? undefined);
  return (
    <Link href={hotelHref(hotel)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={65}
          priority={priority}
          className="object-cover transition group-hover:brightness-95"
        />
        {hotel.propertyType && hotel.propertyType !== "Hotel" ? (
          <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-0.5 text-[0.65rem] font-semibold text-black/80 shadow-sm">
            {hotel.propertyType}
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-accent">
        {hotel.name}
      </p>
      {hotel.city ? <p className="mt-0.5 text-xs text-black/50">{hotel.city}</p> : null}
      {rev ? (
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded-md bg-[#2e7d46] px-1.5 py-0.5 text-xs font-semibold text-white">{rev.score}</span>
          <span className="text-xs text-black/60">
            <b className="text-black">{rev.label}</b>
            {hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()}` : ""}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
