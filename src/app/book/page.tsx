import Link from "next/link";
import Image from "next/image";
import { getOahuHotel } from "@/lib/oahu";
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

  const hotel = hotelId ? getOahuHotel(hotelId) : null;
  const image = hotel?.images?.[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={hotelId ? `/hotel/${hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}` : "/"}
        className="text-sm text-black/50 hover:text-black"
      >
        ← Back
      </Link>

      <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-900">
        <b>Sandbox test checkout.</b> This creates a real, no-charge test reservation — no card is charged
        and no live booking is made.
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* left: guest + payment */}
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

        {/* right: price details */}
        <aside className="bg-white border border-black/5 rounded-2xl p-5 h-fit lg:sticky lg:top-24">
          {image ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3">
              <Image src={image} alt={hotel?.name ?? ""} fill sizes="360px" className="object-cover" />
            </div>
          ) : null}
          <p className="font-semibold">{hotel?.name ?? "Your stay"}</p>
          <p className="text-sm text-black/50">{room}</p>
          <p className="text-sm text-black/50 mt-1">
            {checkin} → {checkout} · {adults} adult{Number(adults) > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-[#1a7a4c] mt-1">Fully refundable</p>

          <div className="mt-4 border-t border-black/5 pt-4 text-sm space-y-1.5">
            <h3 className="font-semibold mb-1">Price details</h3>
            <Row label={`${money(perNight, currency)} × ${nights} night${nights > 1 ? "s" : ""}`} value={money(perNight * nights, currency)} />
            <Row label="Taxes & fees" value="Included" />
          </div>
          <div className="mt-3 border-t border-black/5 pt-3 flex justify-between font-semibold text-base">
            <span>Total ({currency})</span>
            <span>{money(total, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-black/60">
            <span>Pay today</span>
            <span>{money(total, currency)}</span>
          </div>

          <p className="mt-4 rounded-xl bg-accent-tint/60 p-3 text-xs text-black/70">
            <span className="font-medium text-accent">One honest price.</span> One flat fee, included — the
            same for everyone, never based on your data. No hidden markup, no fake discounts.
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
