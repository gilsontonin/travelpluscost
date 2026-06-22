import Link from "next/link";
import Image from "next/image";
import type { VibeHotel } from "@/lib/vibeSearch";
import { money, reviewLabel } from "@/lib/format";

// Showcases what makes vibe search different: the editorial story + matched tags, not just a price.
export default function VibeCard({ hotel, query, priority = false }: { hotel: VibeHotel; query: string; priority?: boolean }) {
  const href = `/hotel/${hotel.id}${query ? `?${query}` : ""}`;
  const rev = reviewLabel(hotel.rating ?? undefined);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/[0.1] bg-white transition-colors hover:border-black/30"
    >
      <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden">
        {hotel.image ? (
          <Image src={hotel.image} alt={hotel.name} fill priority={priority} sizes="(max-width: 640px) 100vw, 400px" quality={70} className="object-cover" />
        ) : null}
        {hotel.locationType ? (
          <span className="absolute top-2 left-2 z-10 bg-white/95 text-black/80 text-[0.65rem] font-semibold px-2 py-0.5 rounded-md shadow-sm">
            {hotel.locationType}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-bold leading-snug tracking-tight text-[1.02rem] text-black group-hover:text-accent transition-colors">
            {hotel.name}
          </h3>
          {rev ? (
            <span className="shrink-0 rounded-md bg-[#2e7d46] px-1.5 py-1 text-[0.78rem] font-bold leading-none tabular-nums text-white">
              {rev.score}
            </span>
          ) : null}
        </div>
        {hotel.city ? <p className="-mt-1 text-[0.78rem] text-black/55">{hotel.city}</p> : null}

        {hotel.story ? <p className="line-clamp-2 text-[0.85rem] leading-relaxed text-black/70">{hotel.story}</p> : null}

        {hotel.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {hotel.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-accent-tint/60 text-accent text-[0.7rem] font-medium px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          {hotel.style ? <span className="line-clamp-1 pr-1 text-[0.72rem] italic text-black/45">{hotel.style}</span> : <span />}
          {hotel.perNight ? (
            <span className="shrink-0 text-right">
              <span className="font-bold text-[1.1rem] tracking-tight text-black">{money(hotel.perNight, hotel.currency)}</span>
              <span className="text-[0.78rem] text-black/60">/night</span>
            </span>
          ) : (
            <span className="text-xs text-black/40">Unavailable</span>
          )}
        </div>
      </div>
    </Link>
  );
}
