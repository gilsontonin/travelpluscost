"use client";

import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";

type Props = {
  hotelId: string;
  room: string;
  total: string; // online portion (room + online taxes)
  feesAtProperty: string; // mandatory fees collected at check-in
  currency: string;
  nights: string;
  checkin: string;
  checkout: string;
  adults: string;
  refundable: string; // "1" | "0"
  freeCancelBefore: string;
};

interface PrebookData {
  prebookId: string;
  secretKey: string;
  transactionId: string;
  price: number;
  currency: string;
}

declare global {
  interface Window {
    LiteAPIPayment?: new (config: Record<string, unknown>) => { handlePayment: () => void };
  }
}

const SDK_SRC = "https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js";
const PAYMENT_ENV = process.env.NEXT_PUBLIC_PAYMENT_ENV === "live" ? "live" : "sandbox";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment form."));
    document.head.appendChild(s);
  });
}

export default function BookingForm(props: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prebook, setPrebook] = useState<PrebookData | null>(null);
  const mounted = useRef(false);

  // Once prebook succeeds, load the Payment SDK and mount the card widget into #pe.
  useEffect(() => {
    if (!prebook || mounted.current) return;
    mounted.current = true;
    (async () => {
      try {
        await loadScript(SDK_SRC);
        if (!window.LiteAPIPayment) throw new Error("Payment form unavailable.");
        const params = new URLSearchParams({
          prebookId: prebook.prebookId,
          transactionId: prebook.transactionId,
          firstName,
          lastName,
          email,
          hotelId: props.hotelId,
          room: props.room,
          online: props.total,
          feesAtProperty: props.feesAtProperty,
          currency: props.currency,
          checkin: props.checkin,
          checkout: props.checkout,
          refundable: props.refundable,
          freeCancelBefore: props.freeCancelBefore,
        });
        const payment = new window.LiteAPIPayment({
          publicKey: PAYMENT_ENV,
          appearance: { theme: "flat" },
          options: { business: { name: "travelpluscost" } },
          targetElement: "#pe",
          secretKey: prebook.secretKey,
          returnUrl: `${window.location.origin}/booking-complete?${params.toString()}`,
        });
        payment.handlePayment();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start payment.");
        mounted.current = false;
        setPrebook(null);
      }
    })();
  }, [prebook, firstName, lastName, email, props]);

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: props.hotelId,
          room: props.room,
          checkin: props.checkin,
          checkout: props.checkout,
          adults: props.adults,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not confirm the room.");
      setPrebook(data as PrebookData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm the room.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent";
  const allIn = (Number(props.total) || 0) + (Number(props.feesAtProperty) || 0);

  // Payment phase — guest captured, card widget mounts here.
  if (prebook) {
    return (
      <div className="space-y-5">
        <section className="bg-white border border-black/5 rounded-2xl p-5">
          <h2 className="font-semibold mb-1">Payment</h2>
          <p className="text-sm text-black/55 mb-4">
            Paying {money(allIn, props.currency)} for {firstName} {lastName}. Test card{" "}
            <span className="font-mono">4242 4242 4242 4242</span>, any future date + CVC.
          </p>
          {/* LiteAPI Payment SDK mounts the card form here */}
          <div id="pe" />
        </section>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-center">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-black/40 text-center">
          Sandbox test booking — no card is charged and no live reservation is made.
        </p>
      </div>
    );
  }

  // Guest phase.
  return (
    <form onSubmit={startPayment} className="space-y-5">
      <section className="bg-white border border-black/5 rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold">Who&apos;s checking in?</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input className={field} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <input className={field} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={field} type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </section>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-center">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white font-semibold px-5 py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? "Confirming the room…" : `Continue to payment · ${money(allIn, props.currency)}`}
      </button>
      <p className="text-xs text-black/40 text-center">
        Sandbox test booking — creates a real, no-charge test reservation via LiteAPI. One honest
        price, the same for everyone.
      </p>
    </form>
  );
}
