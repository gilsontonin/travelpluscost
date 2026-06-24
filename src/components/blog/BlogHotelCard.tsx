import Link from "next/link";
import Image from "next/image";
import type { DirectoryHotel } from "@/lib/directory";
import { hotelHref } from "@/lib/hotelUrl";
import { reviewLabel } from "@/lib/format";

// Inline hotel card for blog posts — `::hotel <hotelId>`. The page pre-fetches the row from the
// directory (server-side) and passes it here. Links to the property page; no price (rates are live).
export default function BlogHotelCard({ hotel }: { hotel: DirectoryHotel }) {
  const href = hotelHref(hotel);
  const loc = [hotel.city, hotel.state].filter(Boolean).join(", ");
  const rev = reviewLabel(hotel.rating ?? undefined);
  return (
    <Link
      href={href}
      className="my-6 flex overflow-hidden rounded-2xl border border-black/[0.1] bg-white transition-colors hover:border-black/30"
    >
      {hotel.thumbnail ? (
        <div className="relative w-32 shrink-0 sm:w-44">
          <Image src={hotel.thumbnail} alt={hotel.name} fill sizes="176px" className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-col justify-center p-4">
        {hotel.stars ? <div className="text-xs text-black/45">{"★".repeat(Math.round(hotel.stars))}</div> : null}
        <div className="font-semibold leading-snug text-black">{hotel.name}</div>
        {loc ? <div className="mt-0.5 text-sm text-black/55">{loc}</div> : null}
        <div className="mt-1.5 flex items-center gap-2 text-sm">
          {hotel.rating != null ? (
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-white">{hotel.rating.toFixed(1)}</span>
          ) : null}
          {rev ? <span className="text-black/55">{rev.label}</span> : null}
          {hotel.review_count ? <span className="text-black/40">· {hotel.review_count.toLocaleString()} reviews</span> : null}
        </div>
        <span className="mt-2 text-sm font-medium text-accent">View hotel →</span>
      </div>
    </Link>
  );
}
