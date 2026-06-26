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
  const online = Number(sp.total ?? 0); // what you pay online — member price for members, else SSP
  const publicOnline = Number(sp.public ?? sp.total ?? 0); // SSP — for the member strikethrough + savings
  const feesAtProperty = Number(sp.feesAtProperty ?? 0); // mandatory fees collected at check-in
  const allIn = online + feesAtProperty; // the one honest number, same as the property page
  const memberSave = Math.max(0, Math.round(publicOnline - online)); // ≥1 → a real member discount
  const currency = sp.currency ?? "USD";
  const nights = Number(sp.nights ?? 1);
  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
  const adults = sp.adults ?? "2";
  const refundable = sp.refundable === "1";
  const freeCancelBefore = sp.freeCancelBefore ?? "";
  const cancelLabel = refundable
    ? freeCancelBefore
      ? `Free cancellation before ${fmtDate(freeCancelBefore)}`
      : "Fully refundable"
    : "Non-refundable";

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

      {process.env.NEXT_PUBLIC_PAYMENT_ENV !== "live" ? (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-900">
          <b>Sandbox test checkout.</b> This creates a real, no-charge test reservation — no card is charged
          and no live booking is made.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* left: guest + payment */}
        <BookingForm
          hotelId={hotelId}
          room={room}
          total={String(online)}
          feesAtProperty={String(feesAtProperty)}
          currency={currency}
          nights={String(nights)}
          checkin={checkin}
          checkout={checkout}
          adults={adults}
          refundable={refundable ? "1" : "0"}
          freeCancelBefore={freeCancelBefore}
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
          <p className={`text-sm mt-1 ${refundable ? "text-[#1a7a4c]" : "text-black/45"}`}>{cancelLabel}</p>

          <div className="mt-4 border-t border-black/5 pt-4 text-sm space-y-1.5">
            <h3 className="font-semibold mb-1">Price details</h3>
            {memberSave >= 1 ? (
              <div className="flex justify-between text-black/45">
                <span>Public price</span>
                <span className="line-through">{money(publicOnline, currency)}</span>
              </div>
            ) : null}
            <Row
              label={`${memberSave >= 1 ? "Member price · room & taxes" : "Room & taxes"} (${nights} night${nights > 1 ? "s" : ""})`}
              value={money(online, currency)}
            />
            {feesAtProperty > 0 ? (
              <Row label="Fees · paid at property" value={money(feesAtProperty, currency)} />
            ) : null}
            {memberSave >= 1 ? (
              <div className="flex justify-between font-semibold text-accent">
                <span>You save</span>
                <span>−{money(memberSave, currency)}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-3 border-t border-black/5 pt-3 flex justify-between font-semibold text-base">
            <span>Total all-in ({currency})</span>
            <span>{money(allIn, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-black/60">
            <span>Pay today</span>
            <span>{money(online, currency)}</span>
          </div>
          {feesAtProperty > 0 ? (
            <div className="flex justify-between text-sm text-black/60">
              <span>At property</span>
              <span>{money(feesAtProperty, currency)}</span>
            </div>
          ) : null}

          <p className="mt-4 rounded-xl bg-accent-tint/60 p-3 text-xs text-black/70">
            <span className="font-medium text-accent">{memberSave >= 1 ? "Member price." : "One honest price."}</span>{" "}
            {memberSave >= 1
              ? `What the hotel charges us plus our flat fee — ${money(memberSave, currency)} below the public rate, the same for every member.`
              : "The same for everyone, never based on your data. Every fee shown up front — no hidden markup, no fake discounts."}
          </p>
        </aside>
      </div>
    </div>
  );
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-black/55">{label}</span>
      <span className="text-black/80 text-right">{value}</span>
    </div>
  );
}
