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

function makeRef() {
  return "TPC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function BookingForm(props: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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

  const field = "w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <form onSubmit={submit} className="bg-white border border-black/5 rounded-2xl p-5 space-y-3">
      <h2 className="font-semibold">Guest details</h2>
      <div className="grid grid-cols-2 gap-3">
        <input className={field} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input className={field} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={field} type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button type="submit" className="w-full bg-accent text-white font-medium px-5 py-3 rounded-xl hover:opacity-90 transition">
        Confirm booking
      </button>
      <p className="text-xs text-black/40 text-center">
        Test booking · no card required, no charge (demo). Same price for everyone.
      </p>
    </form>
  );
}
