import Link from "next/link";
import { notFound } from "next/navigation";
import { getHotel, getRoomOffers } from "@/lib/hotels";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HotelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const adults = sp.adults ? parseInt(sp.adults, 10) : 2;

  const [hotel, roomData] = await Promise.all([
    getHotel(id),
    getRoomOffers(id, { checkin: sp.checkin, checkout: sp.checkout, adults }),
  ]);
  if (!hotel) notFound();

  const { offers, checkin, checkout, nights } = roomData;
  const hero = hotel.images[0];
  const thumbs = hotel.images.slice(1, 5);
  const cheapest = offers[0];

  function reserveHref(offer: (typeof offers)[number]) {
    const q = new URLSearchParams({
      hotelId: hotel!.id,
      room: offer.roomName,
      board: offer.boardName ?? "",
      total: String(offer.price.amount),
      currency: offer.price.currency,
      nights: String(nights),
      perNight: String(offer.price.perNight),
      checkin,
      checkout,
      adults: String(adults),
    });
    return `/book?${q.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link href={`/search?destination=Oahu&adults=${adults}`} className="text-sm text-black/50 hover:text-black">
        ← Back to results
      </Link>

      {/* gallery */}
      <div className="mt-3 grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[300px] sm:h-[440px]">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt={hotel.name}
            className="col-span-4 row-span-2 sm:col-span-2 w-full h-full object-cover"
          />
        ) : (
          <div className="col-span-4 row-span-2 bg-zinc-100" />
        )}
        {thumbs.map((im, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={im.url}
            alt={im.caption || hotel.name}
            className="hidden sm:block col-span-1 row-span-1 w-full h-full object-cover"
          />
        ))}
      </div>

      {/* header */}
      <div className="mt-5">
        <h1 className="text-2xl font-semibold">{hotel.name}</h1>
        <p className="text-sm text-black/55 mt-1">{[hotel.address, hotel.city].filter(Boolean).join(", ")}</p>
        <p className="text-sm mt-1 text-black/70">
          {hotel.rating ? `★ ${(hotel.rating / 2).toFixed(1)}` : ""}
          {hotel.reviewCount ? ` · ${hotel.reviewCount} reviews` : ""}
          {hotel.stars ? ` · ${hotel.stars}-star hotel` : ""}
        </p>
      </div>

      {/* description + promise */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {hotel.description ? (
            <p className="text-black/70 leading-relaxed line-clamp-6">{hotel.description}</p>
          ) : null}

          {hotel.facilities.length ? (
            <div className="mt-6">
              <h2 className="font-semibold mb-3">What this place offers</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.facilities.slice(0, 14).map((f) => (
                  <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-black/[0.04] text-black/70">
                    {f}
                  </span>
                ))}
                {hotel.facilities.length > 14 ? (
                  <span className="text-xs px-3 py-1.5 text-black/40">+{hotel.facilities.length - 14} more</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {hotel.checkin || hotel.checkout ? (
            <p className="mt-6 text-sm text-black/60">
              Check-in {hotel.checkin ?? "—"} · Check-out {hotel.checkout ?? "—"}
            </p>
          ) : null}
        </div>

        {/* cost-plus promise */}
        <aside className="lg:sticky lg:top-24 h-fit bg-white border border-black/5 rounded-2xl p-5">
          {cheapest ? (
            <>
              <div className="text-2xl font-semibold">
                {money(cheapest.price.perNight, cheapest.price.currency)}
                <span className="text-base font-normal text-black/45">/night</span>
              </div>
              <p className="text-sm text-black/55">
                {money(cheapest.price.amount, cheapest.price.currency)} total · {nights} night{nights > 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-black/55">Select dates to see prices.</p>
          )}
          <div className="mt-4 rounded-xl bg-accent-tint/60 p-3 text-sm text-black/70">
            <span className="font-medium text-accent">One honest price.</span> What the hotel charges us, plus one
            small flat fee — the same for everyone, never based on your data.
          </div>
          {cheapest ? (
            <a
              href={reserveHref(cheapest)}
              className="mt-4 block text-center bg-accent text-white font-medium px-5 py-3 rounded-xl hover:opacity-90 transition"
            >
              Reserve
            </a>
          ) : null}
        </aside>
      </div>

      {/* rooms */}
      {offers.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Choose your room</h2>
          <div className="space-y-3">
            {offers.map((o) => (
              <div
                key={o.offerId}
                className="flex flex-wrap items-center justify-between gap-3 bg-white border border-black/5 rounded-2xl p-4"
              >
                <div>
                  <p className="font-medium">{o.roomName}</p>
                  <p className="text-sm text-black/50">
                    {o.boardName ?? "Room only"} · {o.refundable ? "Refundable" : "Non-refundable"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {money(o.price.perNight, o.price.currency)}
                      <span className="text-black/45 font-normal text-sm">/night</span>
                    </div>
                    <div className="text-xs text-black/45">{money(o.price.amount, o.price.currency)} total</div>
                  </div>
                  <a
                    href={reserveHref(o)}
                    className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition"
                  >
                    Reserve
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
