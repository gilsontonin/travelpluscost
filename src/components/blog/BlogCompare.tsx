import Link from "next/link";
import Image from "next/image";
import { directoryToCard, type DirectoryHotel } from "@/lib/directory";
import { hotelHref } from "@/lib/hotelUrl";
import { reviewLabel } from "@/lib/format";

// `::compare <id> <id> [<id>]` — an honest side-by-side of real properties. Real directory fields only:
// no fake "deal", no manufactured "winner". Server component; hotels are pre-fetched by the page.
export default function BlogCompare({ hotels }: { hotels: DirectoryHotel[] }) {
  const hs = hotels.filter(Boolean).slice(0, 3);
  if (hs.length < 2) return null;
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-black/[0.08]">
      <figcaption className="bg-black/[0.03] px-5 py-3 text-sm font-bold text-black">Side by side</figcaption>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${hs.length}, minmax(0,1fr))` }}>
        {hs.map((h) => {
          const card = directoryToCard(h);
          const rev = reviewLabel(h.rating ?? undefined);
          return (
            <div key={h.id} className="border-l border-black/[0.06] p-4 first:border-l-0">
              {card.image ? (
                <div className="relative h-28 overflow-hidden rounded-lg bg-zinc-100">
                  <Image src={card.image} alt={h.name} fill sizes="220px" className="object-cover" />
                </div>
              ) : null}
              <p className="mt-2 text-sm font-semibold leading-snug text-black">{h.name}</p>
              <p className="text-xs text-black/55">{h.city}{h.state ? `, ${h.state}` : ""}</p>
              <dl className="mt-2 space-y-1 text-xs text-black/70">
                <div><dt className="inline text-black/45">Type: </dt><dd className="inline">{h.property_type ?? "Hotel"}</dd></div>
                {h.stars ? <div><dt className="inline text-black/45">Class: </dt><dd className="inline">{h.stars}-star</dd></div> : null}
                {rev ? (
                  <div>
                    <dt className="inline text-black/45">Guests: </dt>
                    <dd className="inline">{rev.score} {rev.label}{h.review_count ? ` (${h.review_count.toLocaleString()})` : ""}</dd>
                  </div>
                ) : null}
              </dl>
              <Link href={hotelHref(card)} className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
                See prices →
              </Link>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
