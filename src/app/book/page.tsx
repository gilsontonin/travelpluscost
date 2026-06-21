import Link from "next/link";
import { getHotel } from "@/lib/hotels";
import BookingForm from "@/components/BookingForm";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const hotelId = sp.hotelId ?? "";
  const room = sp.room ?? "Room";
  const total = Number(sp.total ?? 0);
  const currency = sp.currency ?? "USD";
  const nights = Number(sp.nights ?? 1);
  const perNight = Number(sp.perNight ?? (nights ? Math.round(total / nights) : total));
  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
  const adults = sp.adults ?? "2";

  const hotel = hotelId ? await getHotel(hotelId) : null;
  const image = hotel?.images[0]?.url;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={hotelId ? `/hotel/${hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}` : "/"} className="text-sm text-black/50 hover:text-black">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold mt-3 mb-6">Confirm your booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <BookingForm
          hotelId={hotelId}
          room={room}
          total={String(total)}
          currency={currency}
          nights={String(nights)}
          checkin={checkin}
          checkout={checkout}
          adults={adults}
        />

        <aside className="bg-white border border-black/5 rounded-2xl p-5 h-fit">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={hotel?.name ?? ""} className="w-full h-36 object-cover rounded-xl mb-3" />
          ) : null}
          <p className="font-semibold">{hotel?.name ?? "Your stay"}</p>
          <p className="text-sm text-black/50">{[hotel?.address, hotel?.city].filter(Boolean).join(", ")}</p>

          <div className="mt-4 text-sm space-y-1.5 border-t border-black/5 pt-4">
            <Row label="Room" value={room} />
            <Row label="Dates" value={`${checkin} → ${checkout}`} />
            <Row label="Guests" value={`${adults} adult${Number(adults) > 1 ? "s" : ""}`} />
            <Row label={`${money(perNight, currency)} × ${nights} night${nights > 1 ? "s" : ""}`} value={money(total, currency)} />
          </div>
          <div className="mt-3 border-t border-black/5 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{money(total, currency)}</span>
          </div>
          <p className="mt-3 text-[11px] text-accent/80">
            One flat fee, included — the same price for everyone. We never use your data to set it.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-black/55">{label}</span>
      <span className="text-black/80 text-right">{value}</span>
    </div>
  );
}
