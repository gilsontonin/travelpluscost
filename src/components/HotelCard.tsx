import type { HotelCardData } from "@/lib/hotels";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${Math.round(amount)}`;
  }
}

export default function HotelCard({ hotel }: { hotel: HotelCardData }) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-black/5 bg-white hover:shadow-lg transition">
      <div className="aspect-[4/3] bg-zinc-100 overflow-hidden">
        {hotel.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.image}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-black/30 text-sm">no photo</div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight line-clamp-1">{hotel.name}</h3>
          {hotel.rating ? (
            <span className="shrink-0 text-sm font-medium">★ {(hotel.rating / 2).toFixed(1)}</span>
          ) : null}
        </div>
        <p className="text-sm text-black/50 line-clamp-1">
          {hotel.city}
          {hotel.address ? ` · ${hotel.address}` : ""}
        </p>
        <div className="pt-2">
          {hotel.price ? (
            <>
              <p className="font-semibold">
                {money(hotel.price.amount, hotel.price.currency)}{" "}
                <span className="font-normal text-black/50 text-sm">total</span>
              </p>
              <p className="text-xs text-black/40">one flat fee · same price for everyone</p>
            </>
          ) : (
            <p className="text-sm text-black/40">See prices</p>
          )}
        </div>
      </div>
    </div>
  );
}
