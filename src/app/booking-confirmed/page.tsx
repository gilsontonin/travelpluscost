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
  const hotelId = sp.hotelId ?? "";
  const room = sp.room ?? "Room";
  const total = Number(sp.total ?? 0);
  const currency = sp.currency ?? "USD";
  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
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
        <h1 className="text-2xl font-semibold mt-4">Booking confirmed</h1>
        <p className="text-black/55 mt-1">
          {guest ? `Thanks, ${guest}. ` : ""}A confirmation has been sent{email ? ` to ${email}` : ""}.
        </p>
        <p className="mt-3 inline-block bg-black/[0.04] rounded-md px-4 py-1.5 text-sm font-mono">
          Ref: {ref}
        </p>

        <div className="mt-6 text-left text-sm border-t border-black/5 pt-5 space-y-2">
          <Row label="Hotel" value={hotel?.name ?? "—"} />
          <Row label="Room" value={room} />
          <Row label="Dates" value={`${checkin} → ${checkout}`} />
          <Row label="Total paid" value={money(total, currency)} />
        </div>

        <p className="mt-6 text-xs text-black/40">
          Test booking — no card was charged and no real reservation was made (demo / sandbox). The price you saw
          is the same price everyone sees.
        </p>

        <Link href="/" className="mt-6 inline-block bg-accent text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition">
          Back to home
        </Link>
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
