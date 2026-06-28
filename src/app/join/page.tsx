import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "See member prices",
  description:
    "Create a free account to see member prices — hotels at what they charge us plus one small flat fee, the same price for everyone, never based on your data.",
};

// Free signup funnel — passwordless. The account unlocks member prices (below the public rate, a permitted
// logged-in group). No paid tier, no card, no catch.
export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">See member prices</h1>
      <p className="mt-3 text-black/70">
        See <b>member prices</b> — what the hotel charges us, plus one small flat fee — the same price for
        everyone, never based on your data.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-black/80">
        <li>✓ <b>Free, always</b> — no card, no subscription, no catch.</li>
        <li>✓ Member prices the moment you sign in — our cost plus one small flat fee, never above the public rate.</li>
        <li>✓ Save your favorite stays, no surveillance pricing, no fake discounts — every number shown up front.</li>
      </ul>

      <div className="mt-8">
        <AuthForm />
      </div>

      <p className="mt-6 text-xs text-black/60">
        Free forever. We only ever make our one small flat fee when you book — the same fee for everyone, never
        based on who you are.
      </p>
    </div>
  );
}
