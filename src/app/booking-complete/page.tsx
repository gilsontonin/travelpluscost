import Link from "next/link";
import { redirect } from "next/navigation";
import { sandboxBookWithTransaction } from "@/lib/booking";

// The Payment SDK redirects here after the card is charged. We finalise the reservation
// (book with TRANSACTION_ID) then forward to the confirmation page. Never cached.
export const dynamic = "force-dynamic";

export default async function BookingCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const prebookId = sp.prebookId ?? "";
  const transactionId = sp.transactionId ?? "";
  const firstName = sp.firstName ?? "";
  const lastName = sp.lastName ?? "";
  const email = sp.email ?? "";

  let booked: { bookingId: string; confirmationCode: string; status: string } | null = null;
  let error = "";
  if (prebookId && transactionId) {
    try {
      booked = await sandboxBookWithTransaction({ prebookId, transactionId, firstName, lastName, email });
    } catch (e) {
      error = e instanceof Error ? e.message : "Booking failed.";
    }
  } else {
    error = "Missing payment confirmation details.";
  }

  if (booked) {
    // Display the production all-in the guest agreed to, not the sandbox amount (kept consistent
    // with the property page + checkout).
    const online = Number(sp.online ?? 0);
    const fees = Number(sp.feesAtProperty ?? 0);
    const q = new URLSearchParams({
      ref: booked.bookingId || booked.confirmationCode || "—",
      bookingId: booked.bookingId || "",
      status: booked.status || "",
      hotelId: sp.hotelId ?? "",
      room: sp.room ?? "Room",
      total: String(online + fees),
      online: String(online),
      feesAtProperty: String(fees),
      currency: sp.currency ?? "USD",
      checkin: sp.checkin ?? "",
      checkout: sp.checkout ?? "",
      refundable: sp.refundable ?? "0",
      freeCancelBefore: sp.freeCancelBefore ?? "",
      guest: `${firstName} ${lastName}`.trim(),
      email,
    });
    redirect(`/booking-confirmed?${q.toString()}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">We couldn&apos;t complete your booking</h1>
      <p className="mt-2 text-sm text-black/55">{error}</p>
      <p className="mt-2 text-xs text-black/45">
        If your card was charged in the test flow, no live charge was made (sandbox). Please try again.
      </p>
      <Link href="/" className="mt-6 inline-block bg-accent text-white font-medium px-6 py-3 rounded-full">
        Back to home
      </Link>
    </div>
  );
}
