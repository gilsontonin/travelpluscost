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
  board: string;
  refundable: string; // "1" | "0"
  freeCancelBefore: string;
  // Fired when prebook confirms, so the price sidebar can reconcile to the EXACT charged amount.
  onConfirmed?: (d: { price: number; priceChanged?: boolean }) => void;
};

interface PrebookData {
  prebookId: string;
  secretKey: string;
  transactionId: string;
  price: number; // amount charged NOW (room + online taxes, margin applied)
  currency: string;
  feesAtProperty: number; // mandatory fees paid at the hotel — NOT charged now
  priceChanged?: boolean; // the room's live price rose above what was shown — the amount above is current
}

declare global {
  interface Window {
    LiteAPIPayment?: new (config: Record<string, unknown>) => { handlePayment: () => void };
  }
}

const SDK_SRC = "https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1";
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

const IS_SANDBOX = PAYMENT_ENV !== "live";
const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com"];

// US phone, formatted as the user types: (555) 123-4567
function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// Suggest common providers once they start the email (before or after the "@").
function emailSuggestions(email: string): string[] {
  if (!email || /\s/.test(email)) return [];
  const at = email.indexOf("@");
  if (at === -1) return EMAIL_DOMAINS.map((d) => `${email}@${d}`);
  const local = email.slice(0, at);
  if (!local) return [];
  const partial = email.slice(at + 1).toLowerCase();
  return EMAIL_DOMAINS.filter((d) => d.startsWith(partial) && d !== partial).map((d) => `${local}@${d}`);
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
  const prefetch = useRef<Promise<PrebookData> | null>(null);
  const prefetchStarted = useRef(false);

  // One prebook attempt with a 20s timeout (LiteAPI's prebook can stall). On a timeout/transient failure we
  // retry ONCE — since this is prefetched while the guest types, the retry usually finishes before they click.
  const requestPrebook = async (attempt = 0): Promise<PrebookData> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch("/api/prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          hotelId: props.hotelId,
          room: props.room,
          checkin: props.checkin,
          checkout: props.checkout,
          adults: props.adults,
          // Lock the SAME room/rate the guest saw + charge the price they accepted ("one true price").
          board: props.board,
          refundable: props.refundable === "1",
          agreedPrice: Number(props.total) || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "Could not confirm the room.");
      return d as PrebookData;
    } catch (e) {
      if (attempt < 1) return requestPrebook(attempt + 1); // one silent auto-retry on a slow/failed call
      throw e instanceof Error && e.name === "AbortError" ? new Error("Confirming the room is taking longer than usual — please try again.") : e;
    } finally {
      clearTimeout(timer);
    }
  };

  // Warm everything up while the guest is typing: preload the payment SDK script AND kick off the
  // prebook (2 rate calls + walking production offers takes several seconds). By the time they click
  // "Continue to payment" it's already done, so Stripe appears instantly instead of after 10–15s.
  useEffect(() => {
    if (prefetchStarted.current) return;
    prefetchStarted.current = true;
    loadScript(SDK_SRC).catch(() => {});
    const p = requestPrebook();
    p.catch(() => {}); // ignore here — surfaced on submit if it failed
    prefetch.current = p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once prebook succeeds, load the Payment SDK and mount the card widget into #pe.
  useEffect(() => {
    if (!prebook || mounted.current) return;
    mounted.current = true;
    (async () => {
      try {
        console.log("[pay] loading SDK…");
        await loadScript(SDK_SRC);
        console.log("[pay] SDK loaded; LiteAPIPayment =", typeof window.LiteAPIPayment);
        if (!window.LiteAPIPayment) throw new Error("Payment form unavailable.");
        if (!document.getElementById("pe")) throw new Error("Payment container missing.");
        const params = new URLSearchParams({
          prebookId: prebook.prebookId,
          transactionId: prebook.transactionId,
          firstName,
          lastName,
          email,
          hotelId: props.hotelId,
          room: props.room,
          // the authoritative numbers from prebook — what was actually charged + the real at-property fee
          online: String(prebook.price),
          feesAtProperty: String(prebook.feesAtProperty),
          currency: prebook.currency,
          checkin: props.checkin,
          checkout: props.checkout,
          refundable: props.refundable,
          freeCancelBefore: props.freeCancelBefore,
        });
        // Match LiteAPI's reference exactly: pass ONLY secretKey (no amount/currency — those trigger
        // a different code path). The SDK swallows its own errors silently, so we add a watchdog.
        const payment = new window.LiteAPIPayment({
          publicKey: PAYMENT_ENV,
          appearance: { theme: "flat" },
          options: { business: { name: "travelpluscost" } },
          targetElement: "#pe",
          secretKey: prebook.secretKey,
          returnUrl: `${window.location.origin}/booking-complete?${params.toString()}`,
        });
        console.log("[pay] calling handlePayment() into #pe", { env: PAYMENT_ENV });
        payment.handlePayment();
        console.log("[pay] handlePayment() returned; waiting for the provider to render…");
        // The SDK fetches /config then async-loads Stripe and renders — all inside a silent try/catch.
        // If nothing lands in #pe, surface it (the real error will be in the Network tab).
        window.setTimeout(() => {
          const pe = document.getElementById("pe");
          if (pe && pe.childElementCount === 0) {
            console.error("[pay] widget never rendered into #pe — check Network tab for blocked calls to payment-wrapper.liteapi.travel/config or the Stripe provider script");
            setError("The payment form didn't load. Open the browser console / Network tab and look for a blocked request to payment-wrapper.liteapi.travel.");
          } else {
            console.log("[pay] widget rendered ✓ (#pe has content)");
          }
        }, 6000);
      } catch (e) {
        console.error("[pay] mount failed:", e);
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
      // Use the prebook already in flight from page load; only fetch fresh if it failed/absent.
      let data: PrebookData | null = null;
      if (prefetch.current) {
        try {
          data = await prefetch.current;
        } catch {
          data = null;
        }
      }
      if (!data) data = await requestPrebook();
      setPrebook(data);
      props.onConfirmed?.({ price: data.price, priceChanged: data.priceChanged });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm the room.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent";
  // The CTA must reflect what's charged NOW (online room + taxes). The at-property fee is paid at the
  // hotel, not by us — putting the all-in on a "payment" button overstates the charge (every fee is
  // still broken out in the summary + the "A $X fee is collected at the hotel — not now" note).
  const payToday = Number(props.total) || 0;

  // Payment phase — guest captured, card widget mounts here.
  if (prebook) {
    return (
      <div className="space-y-5">
        <section className="bg-card border border-black/[0.07] rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold mb-1">Payment</h2>
          <p className="text-sm text-black/55 mb-4">
            Paying <b>{money(prebook.price, prebook.currency)}</b> now for {firstName} {lastName}.
            {prebook.feesAtProperty > 0
              ? ` A ${money(prebook.feesAtProperty, prebook.currency)} fee is collected at the hotel — not now.`
              : ""}
            {IS_SANDBOX ? (
              <>
                {" "}Test card <span className="font-mono">4242 4242 4242 4242</span>, any future date + CVC.
              </>
            ) : null}
          </p>
          {prebook.priceChanged ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              Heads up — this room&apos;s price changed since you viewed it. The amount above is the current price.
            </p>
          ) : null}
          {/* LiteAPI Payment SDK mounts the card form here */}
          <div id="pe" className="min-h-[220px]" />
        </section>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-center">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-black/40 text-center">
          {IS_SANDBOX
            ? "Sandbox test booking — no card is charged and no live reservation is made."
            : "Your card is processed securely. One honest price — the same for everyone."}
        </p>
      </div>
    );
  }

  // Guest phase.
  return (
    <form onSubmit={startPayment} className="space-y-5">
      <section className="bg-card border border-black/[0.07] rounded-2xl p-5 space-y-3 shadow-card">
        <h2 className="font-semibold">Who&apos;s checking in?</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="First name" autoComplete="given-name" name="given-name"
            value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input className={field} placeholder="Last name" autoComplete="family-name" name="family-name"
            value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <input className={field} type="email" placeholder="Email address" autoComplete="email" name="email"
          list="tpc-email-domains" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <datalist id="tpc-email-domains">
          {emailSuggestions(email).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <input className={field} type="tel" placeholder="Phone number" autoComplete="tel" name="tel" inputMode="tel"
          value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
      </section>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-center">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-white font-semibold px-5 py-3.5 rounded-full hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? "Confirming the room…" : `Continue to payment · ${money(payToday, props.currency)}`}
      </button>
      <p className="text-xs text-black/40 text-center">
        {IS_SANDBOX
          ? "Sandbox test booking — creates a real, no-charge test reservation via LiteAPI."
          : "One honest price — the same for everyone, never based on your data."}
      </p>
    </form>
  );
}
