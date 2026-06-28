"use client";

import { useState } from "react";
import Link from "next/link";
import { money } from "@/lib/format";

type Details = {
  bookingId: string;
  status: string;
  confirmationCode: string;
  holderName: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  roomName: string;
  boardName?: string;
  price: number;
  currency: string;
  refundable: boolean;
  freeCancelBefore: string | null;
  cancelChargeAfter: { amount: number; currency: string } | null;
  cancelled: boolean;
};
type CancelResult = { status: string; cancellationFee: number; refundAmount: number; currency: string };

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CancelClient({ initialBookingId = "" }: { initialBookingId?: string }) {
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState<Details | null>(null);
  const [result, setResult] = useState<CancelResult | { alreadyCancelled: true; status: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const field = "w-full border border-black/15 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-accent";

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDetails(null);
    setResult(null);
    try {
      const res = await fetch("/api/booking-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingId.trim(), email: email.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "Lookup failed.");
      setDetails(d as Details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function doCancel() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/booking-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingId.trim(), email: email.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "Cancellation failed.");
      setResult(d);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed.");
    } finally {
      setBusy(false);
    }
  }

  // ── Result screen ──
  if (result) {
    const refunded = "refundAmount" in result ? result.refundAmount : 0;
    const fee = "cancellationFee" in result ? result.cancellationFee : 0;
    const currency = "currency" in result ? result.currency : details?.currency ?? "USD";
    const already = "alreadyCancelled" in result;
    return (
      <div className="bg-white border border-black/5 rounded-2xl p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent-tint grid place-items-center text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 className="text-xl font-semibold mt-3">{already ? "Already cancelled" : "Booking cancelled"}</h2>
        {already ? (
          <p className="text-black/55 mt-1 text-sm">This reservation was already cancelled — nothing more to do.</p>
        ) : (
          <div className="mt-4 text-left text-sm border-t border-black/5 pt-4 space-y-1.5 max-w-sm mx-auto">
            <Row label="Refunded to your card" value={money(refunded, currency)} />
            {fee > 0 ? <Row label="Cancellation charge" value={money(fee, currency)} /> : null}
            <p className="text-xs text-black/60 pt-2">
              {refunded > 0
                ? "Refunds typically take 5–10 business days to appear, depending on your bank."
                : "Per this room's cancellation policy, no refund is due for this cancellation."}
            </p>
          </div>
        )}
        <Link href="/" className="mt-6 inline-block bg-accent text-white font-medium px-6 py-3 rounded-full hover:opacity-90 transition">
          Back to home
        </Link>
      </div>
    );
  }

  // ── Details + cancel ──
  if (details) {
    const policy = !details.refundable
      ? "Non-refundable — cancelling won't refund the room (a partial refund may still apply per the hotel)."
      : details.freeCancelBefore
        ? `Free cancellation before ${fmtDate(details.freeCancelBefore)}${details.cancelChargeAfter ? ` · after that, ${money(details.cancelChargeAfter.amount, details.cancelChargeAfter.currency)}` : ""}`
        : "Fully refundable";
    return (
      <div className="bg-white border border-black/5 rounded-2xl p-6">
        <h2 className="font-semibold">{details.hotelName}</h2>
        <p className="text-sm text-black/55">{details.holderName}</p>
        <div className="mt-4 text-sm border-t border-black/5 pt-4 space-y-1.5">
          <Row label="Confirmation" value={details.confirmationCode} />
          <Row label="Room" value={details.roomName} />
          <Row label="Dates" value={`${fmtDate(details.checkin)} → ${fmtDate(details.checkout)}`} />
          <Row label="Total paid" value={money(details.price, details.currency)} />
          <Row label="Status" value={details.cancelled ? "Cancelled" : details.status} />
        </div>
        <p className={`mt-3 text-sm ${details.refundable ? "text-[#1a7a4c]" : "text-black/55"}`}>{policy}</p>

        {error ? <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{error}</p> : null}

        {details.cancelled ? (
          <p className="mt-5 text-sm text-black/55">This booking is already cancelled.</p>
        ) : confirming ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-black/80">Cancel this booking? The refund (if any) follows the policy above and can&apos;t be undone.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={doCancel} disabled={busy}
                className="bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60">
                {busy ? "Cancelling…" : "Yes, cancel it"}
              </button>
              <button onClick={() => setConfirming(false)} disabled={busy}
                className="text-sm font-medium px-4 py-2.5 rounded-xl border border-black/15 hover:border-black/30">
                Keep booking
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)}
            className="mt-5 w-full border border-red-300 text-red-700 font-semibold py-3 rounded-xl hover:bg-red-50 transition">
            Cancel this booking
          </button>
        )}
      </div>
    );
  }

  // ── Lookup form ──
  return (
    <form onSubmit={lookup} className="bg-white border border-black/5 rounded-2xl p-6 space-y-3">
      <p className="text-sm text-black/55">Enter your booking ID and the email you booked with.</p>
      <input className={field} placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required />
      <input className={field} type="email" placeholder="Email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{error}</p> : null}
      <button type="submit" disabled={busy} className="w-full bg-accent text-white font-semibold py-3 rounded-full hover:opacity-90 transition disabled:opacity-60">
        {busy ? "Finding your booking…" : "Find my booking"}
      </button>
    </form>
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
