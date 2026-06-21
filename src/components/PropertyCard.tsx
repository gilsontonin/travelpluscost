import type { HotelCardData } from "@/lib/hotels";

function money(n: number, c: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

export default function PropertyCard({ hotel }: { hotel: HotelCardData }) {
  return (
    <article className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition">
      <div className="relative aspect-[16/11] bg-zinc-100">
        {hotel.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hotel.image} alt={hotel.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-black/30 text-sm">no photo</div>
        )}
        {hotel.rating ? (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
            {(hotel.rating / 2).toFixed(1)} <span className="text-amber-400">★</span>
          </span>
        ) : null}
        <span className="absolute top-3 right-3 bg-white/95 w-8 h-8 rounded-full grid place-items-center shadow-sm text-black/60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-tight line-clamp-1">{hotel.name}</h3>
        <p className="text-sm text-black/45 mt-0.5 line-clamp-1">
          {[hotel.address, hotel.city].filter(Boolean).join(", ")}
        </p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-xs text-black/50">{hotel.stars ? `${hotel.stars}-star hotel` : "Hotel"}</span>
          {hotel.price ? (
            <div className="text-right">
              <div className="font-semibold">
                {money(hotel.price.perNight, hotel.price.currency)}
                <span className="text-black/45 font-normal text-sm">/night</span>
              </div>
              <div className="text-xs text-black/45 underline decoration-black/20">
                {money(hotel.price.amount, hotel.price.currency)}/total
              </div>
            </div>
          ) : (
            <span className="text-sm text-black/40">See prices</span>
          )}
        </div>
        <p className="mt-2 text-[11px] text-accent/80">Same price for everyone · no hidden markup</p>
      </div>
    </article>
  );
}
