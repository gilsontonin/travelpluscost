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

  // If we got here with payment IDs, the SDK ALREADY charged the card before redirecting — so this is a
  // post-charge finalise failure. NEVER tell the guest to "try again" (that would re-charge in live);
  // give them their reference + how to reach us. Only the missing-IDs case (no charge yet) is safe to retry.
  const postCharge = Boolean(prebookId && transactionId);
  const isSandbox = process.env.NEXT_PUBLIC_PAYMENT_ENV !== "live";
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {postCharge ? (
        <>
          <h1 className="text-xl font-semibold">Payment received — we&apos;re confirming your room</h1>
          <p className="mt-3 text-sm text-black/70">
            {isSandbox
              ? "This was a sandbox test (no real charge), but the reservation didn't finalise on our side."
              : "Your card was charged and we&apos;re finalising the reservation — please do not pay again."}
          </p>
          <p className="mt-4 text-xs text-black/55">Save this reference</p>
          <p className="mt-1 font-mono text-base font-semibold break-all">{transactionId}</p>
          <p className="mt-4 text-sm text-black/70">
            If you don&apos;t receive a confirmation email shortly, email{" "}
            <a
              className="text-accent underline"
              href={`mailto:hello@travelpluscost.com?subject=${encodeURIComponent(`Booking confirmation — ref ${transactionId}`)}`}
            >
              hello@travelpluscost.com
            </a>{" "}
            with this reference and we&apos;ll sort it out right away.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold">We couldn&apos;t start your booking</h1>
          <p className="mt-2 text-sm text-black/55">{error}</p>
          <p className="mt-2 text-xs text-black/45">No charge was made — please try again.</p>
        </>
      )}
      <Link href="/" className="mt-6 inline-block bg-accent text-white font-medium px-6 py-3 rounded-full">
        Back to home
      </Link>
    </div>
  );
}
