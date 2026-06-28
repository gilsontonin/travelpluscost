import Link from "next/link";
import { getDirectoryHotel } from "@/lib/directory";
import Checkout from "@/components/Checkout";
import TrackEvent from "@/components/TrackEvent";

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
  const currency = sp.currency ?? "USD";
  const nights = Number(sp.nights ?? 1);
  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
  const adults = sp.adults ?? "2";
  const board = sp.board ?? "";
  const refundable = sp.refundable === "1";
  const freeCancelBefore = sp.freeCancelBefore ?? "";
  const cancelLabel = refundable
    ? freeCancelBefore
      ? `Free cancellation before ${fmtDate(freeCancelBefore)}`
      : "Fully refundable"
    : "Non-refundable";

  // Full national directory (not the Oahu-only shim), so the summary shows the right name + photo for ANY
  // hotel — matches what the confirmation page already uses.
  const hotel = hotelId ? await getDirectoryHotel(hotelId) : null;
  const image = hotel?.thumbnail ?? undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <TrackEvent
        event="begin_checkout"
        params={{
          value: allIn,
          currency,
          items: hotelId ? [{ item_id: hotelId, item_name: hotel?.name, item_category: "hotel" }] : undefined,
        }}
      />
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

      <Checkout
        hotelId={hotelId}
        hotelName={hotel?.name}
        image={image}
        room={room}
        board={board}
        online={online}
        publicOnline={publicOnline}
        feesAtProperty={feesAtProperty}
        currency={currency}
        nights={nights}
        checkin={checkin}
        checkout={checkout}
        adults={adults}
        refundable={refundable}
        freeCancelBefore={freeCancelBefore}
        cancelLabel={cancelLabel}
      />
    </div>
  );
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
