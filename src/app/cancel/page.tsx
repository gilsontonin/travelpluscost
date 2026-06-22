import type { Metadata } from "next";
import CancelClient from "@/components/CancelClient";

// Utility page — keep it out of search results.
export const metadata: Metadata = {
  title: "Manage your booking — travelpluscost",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const bookingId = sp.bookingId ?? "";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Manage your booking</h1>
      <p className="text-black/55 mt-1 mb-6 text-sm">View or cancel a reservation. Any refund follows the room&apos;s cancellation policy.</p>
      <CancelClient initialBookingId={bookingId} />
    </div>
  );
}
