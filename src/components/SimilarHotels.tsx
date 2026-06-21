import Image from "next/image";
import Link from "next/link";
import { getNearbyHotels } from "@/lib/oahu";
import { fmtMiles } from "@/lib/distance";
import { reviewLabel } from "@/lib/format";

// "Other places to stay nearby" — the closest hotels in our set. Engagement + internal linking.
export default function SimilarHotels({ id }: { id: string }) {
  const nearby = getNearbyHotels(id, 8);
  if (!nearby.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Other places to stay nearby</h2>
      <div className="flex gap-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {nearby.map(({ hotel, miles }) => {
          const rev = reviewLabel(hotel.rating ?? undefined);
          return (
            <Link key={hotel.id} href={`/hotel/${hotel.id}`} className="group shrink-0 w-52 snap-start">
              <div className="relative h-36 rounded-lg overflow-hidden bg-zinc-100">
                <Image src={hotel.image} alt={hotel.name} fill sizes="208px" className="object-cover" />
              </div>
              <p className="mt-2 font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {hotel.name}
              </p>
              <p className="text-xs text-black/50 mt-0.5">
                {fmtMiles(miles)} away{hotel.city ? ` · ${hotel.city}` : ""}
              </p>
              {rev ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="bg-[#2e7d46] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">{rev.score}</span>
                  <span className="text-xs text-black/60">
                    <b className="text-black">{rev.label}</b>
                    {hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()}` : ""}
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
