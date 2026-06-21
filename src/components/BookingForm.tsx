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

function makeRef() {
  return "TPC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function BookingForm(props: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState("card");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({
      ref: makeRef(),
      hotelId: props.hotelId,
      room: props.room,
      total: props.total,
      currency: props.currency,
      nights: props.nights,
      checkin: props.checkin,
      checkout: props.checkout,
      adults: props.adults,
      guest: `${firstName} ${lastName}`.trim(),
      email,
    });
    router.push(`/booking-confirmed?${q.toString()}`);
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

      <button type="submit" className="w-full bg-accent text-white font-semibold px-5 py-3.5 rounded-xl hover:opacity-90 transition">
        Book now
      </button>
      <p className="text-xs text-black/40 text-center">
        Test booking · no card required, no charge (demo). One flat fee — the same price for everyone.
      </p>
    </form>
  );
}
