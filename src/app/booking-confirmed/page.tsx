import Link from "next/link";
import { getOahuHotel } from "@/lib/oahu";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const ref = sp.ref ?? "TPC-DEMO";
  const bookingId = sp.bookingId ?? "";
  const status = sp.status ?? "";
  const hotelId = sp.hotelId ?? "";
  const room = sp.room ?? "Room";
  const total = Number(sp.total ?? 0); // all-in (online + at-property)
  const online = Number(sp.online ?? total);
  const feesAtProperty = Number(sp.feesAtProperty ?? 0);
  const currency = sp.currency ?? "USD";
  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
  const refundable = sp.refundable === "1";
  const freeCancelBefore = sp.freeCancelBefore ?? "";
  const cancelLabel = refundable
    ? freeCancelBefore
      ? `Free cancellation before ${fmtDate(freeCancelBefore)}`
      : "Fully refundable"
    : "Non-refundable";
  const guest = sp.guest ?? "";
  const email = sp.email ?? "";

  const hotel = hotelId ? getOahuHotel(hotelId) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="bg-white border border-black/5 rounded-2xl p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-accent-tint grid place-items-center text-accent">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        {process.env.NEXT_PUBLIC_PAYMENT_ENV !== "live" ? (
          <span className="mt-3 inline-block rounded-full bg-amber-100 text-amber-800 text-[0.7rem] font-semibold px-2.5 py-1 tracking-wide">
            SANDBOX · TEST BOOKING · NO CHARGE
          </span>
        ) : null}
        <h1 className="text-2xl font-semibold mt-3">Booking {status ? status.toLowerCase() : "confirmed"}</h1>
        <p className="text-black/55 mt-1">
          {guest ? `Thanks, ${guest}. ` : ""}Your reservation is confirmed{email ? ` for ${email}` : ""}.
        </p>
        <p className="mt-3 inline-block bg-black/[0.04] rounded-md px-4 py-1.5 text-sm font-mono">
          Confirmation: {ref}
        </p>

        <div className="mt-6 text-left text-sm border-t border-black/5 pt-5 space-y-2">
          <Row label="Hotel" value={hotel?.name ?? "—"} />
          <Row label="Room" value={room} />
          <Row label="Dates" value={`${checkin} → ${checkout}`} />
          <Row label="Cancellation" value={cancelLabel} />
          {bookingId ? <Row label="Booking ID" value={bookingId} /> : null}
          {status ? <Row label="Status" value={status} /> : null}
        </div>

        <div className="mt-4 text-left text-sm border-t border-black/5 pt-4 space-y-1.5">
          <Row label="Room & taxes" value={money(online, currency)} />
          {feesAtProperty > 0 ? <Row label="Fees · paid at property" value={money(feesAtProperty, currency)} /> : null}
          <div className="flex justify-between gap-3 font-semibold border-t border-black/5 mt-1.5 pt-1.5">
            <span>Total all-in ({currency})</span>
            <span>{money(total, currency)}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-black/40">
          {process.env.NEXT_PUBLIC_PAYMENT_ENV !== "live"
            ? "This is a real reservation in LiteAPI's sandbox — a genuine confirmation code, but no card was charged and no live booking was made. The price shown is the same price everyone sees."
            : "Save your confirmation code above. The price shown is the same price everyone sees — never based on your data."}
        </p>

        <Link href="/" className="mt-6 inline-block bg-accent text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition">
          Back to home
        </Link>
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
