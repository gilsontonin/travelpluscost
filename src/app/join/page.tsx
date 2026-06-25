import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Become a founding member",
  description:
    "Founding members lock in our lowest membership rate. Members book hotels at our cost plus one small fee — the same price for everyone, never based on your data.",
};

// Founding-member funnel. Free to join now (builds the launch list + proves the funnel); paid membership +
// the unlocked member price go live when bookings do. No real charge here — just the account + the pitch.
export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Become a founding member</h1>
      <p className="mt-3 text-black/70">
        Members book hotels at <b>what the hotel charges us, plus one small fee</b> — typically{" "}
        <b>20–35% below the public rate</b>, the same price for everyone, never based on your data.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-black/80">
        <li>✓ Lock in the <b>founding rate</b> — $19/mo (or $79/yr) when we launch. Free until then.</li>
        <li>✓ The member price is our cost + a small fee — save more than the membership or it&apos;s refunded.</li>
        <li>✓ No surveillance pricing, no fake discounts, no junk fees. Every number shown up front.</li>
      </ul>

      <div className="mt-8">
        <AuthForm />
      </div>

      <p className="mt-6 text-xs text-black/40">
        Founding membership is free today. Paid billing and the unlocked member price begin when booking
        launches — you&apos;ll keep the founding rate.
      </p>
    </div>
  );
}
