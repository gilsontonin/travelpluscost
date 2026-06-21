"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  hotelId: string;
  room: string;
  total: string;
  currency: string;
  nights: string;
  checkin: string;
  checkout: string;
  adults: string;
};

const PAY = [
  { id: "card", label: "Card" },
  { id: "affirm", label: "Affirm" },
  { id: "paypal", label: "PayPal" },
  { id: "applepay", label: "Apple Pay" },
  { id: "googlepay", label: "Google Pay" },
];

export default function BookingForm(props: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState("card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: props.hotelId,
          room: props.room,
          checkin: props.checkin,
          checkout: props.checkout,
          adults: props.adults,
          firstName,
          lastName,
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Booking failed.");
      const q = new URLSearchParams({
        ref: data.bookingId || data.confirmationCode || "—",
        bookingId: data.bookingId || "",
        status: data.status || "",
        hotelId: props.hotelId,
        room: data.room || props.room,
        total: String(data.total || props.total),
        currency: data.currency || props.currency,
        checkin: props.checkin,
        checkout: props.checkout,
        guest: `${firstName} ${lastName}`.trim(),
        email,
      });
      router.push(`/booking-confirmed?${q.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
      setBusy(false);
    }
  }

  const field = "w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="bg-white border border-black/5 rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold">Who&apos;s checking in?</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input className={field} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <input className={field} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={field} type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </section>

      <section className="bg-white border border-black/5 rounded-2xl p-5 space-y-2">
        <h2 className="font-semibold mb-1">Payment details</h2>
        {PAY.map((p) => (
          <label
            key={p.id}
            className={`flex items-center gap-3 border rounded-xl px-3 py-3 cursor-pointer ${
              pay === p.id ? "border-accent bg-accent-tint/40" : "border-black/10"
            }`}
          >
            <span className={`w-4 h-4 rounded-full border grid place-items-center ${pay === p.id ? "border-accent" : "border-black/30"}`}>
              {pay === p.id ? <span className="w-2 h-2 rounded-full bg-accent" /> : null}
            </span>
            <input type="radio" name="pay" className="sr-only" checked={pay === p.id} onChange={() => setPay(p.id)} />
            <span className="text-sm">{p.label}</span>
          </label>
        ))}
        <input className={`${field} mt-2`} placeholder="Billing ZIP code" />
      </section>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-center">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white font-semibold px-5 py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? "Confirming your booking…" : "Book now"}
      </button>
      <p className="text-xs text-black/40 text-center">
        Sandbox test booking — creates a real, no-charge test reservation via LiteAPI. No card is
        charged. One honest price, the same for everyone.
      </p>
    </form>
  );
}
