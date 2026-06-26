import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, abs } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `About ${SITE_NAME} — one honest price, no gimmicks` },
  description:
    "Why you pay what you pay on travelpluscost: the hotel's rate plus one small flat fee, the same for everyone. No fake discounts, no points, no gimmicks.",
  alternates: { canonical: "/about" },
  openGraph: { type: "website", title: `About ${SITE_NAME}`, url: "/about" },
};

// Each gimmick + the plain truth. Framed as industry practice — never a false claim about a named
// competitor. Keeps the "one flat fee" as the principle (not a number), per the parity rule.
const GIMMICKS: { name: string; truth: string }[] = [
  { name: "Fake discounts", truth: "“$240 $89!” — the $240 was never a real price. It's an anchor to make $89 feel like a win. We don't strike through imaginary numbers." },
  { name: "Vanity points & rewards", truth: "Points worth a fraction of a cent, designed to lock you in and pull your eye off the price. We don't run a points casino." },
  { name: "VIP / preferred / member tiers", truth: "A manufactured hierarchy that “unlocks” treatment everyone should just get. There's one tier here: everyone." },
  { name: "Urgency & scarcity", truth: "“Only 1 left!” “3 people are looking!” Manufactured panic. We'll never rush you with a fake clock." },
  { name: "Drip pricing", truth: "Resort fees and surprise “taxes & fees” sprung at checkout. Ours are in the number from the first screen." },
  { name: "Surveillance pricing", truth: "Prices that quietly change based on your phone, location, or history. Ours never move because of you." },
];

const VALUES: { title: string; body: string }[] = [
  { title: "Transparency over tricks", body: "If we can't explain it in a sentence, we don't do it." },
  { title: "One price for everyone", body: "Never changed by your device, location, or browsing history." },
  { title: "Simplicity is honesty", body: "Complexity is how the industry hides the real cost. We strip it out." },
  { title: "Your data is yours", body: "We never profile you to set a price. You aren't the product." },
  { title: "Earn trust, don't fake it", body: "No invented urgency, no vanity rewards — just be worth choosing." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden>›</span>
        <span className="text-black/70">About</span>
      </nav>

      {/* 30-second pitch */}
      <header className="mt-5 max-w-3xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Why you pay what you pay</h1>
        <p className="mt-5 text-lg leading-relaxed text-black/80">
          Here it is, in one breath. The price is <strong>what the hotel charges us, plus one small flat fee</strong> —
          the same for everyone, on every device, every time. No fake “discounts” off prices that were never real. No
          points worth a fraction of a cent. No “VIP” tiers or preferred programs. No countdown timers. None of the
          gimmicks the travel industry bolts on to make the real price impossible to find. Just the honest number.
        </p>
        <div className="mt-6 h-1 w-16 rounded-full bg-accent" />
      </header>

      {/* mission + vision */}
      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-black/[0.08] bg-white p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">Mission</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-black/75">
            Give every traveler one honest price — the real cost plus one transparent fee — and make the manipulative
            parts of online travel obsolete.
          </p>
        </div>
        <div className="rounded-xl border border-black/[0.08] bg-white p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">Vision</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-black/75">
            A travel industry where the price you see is the price everyone sees — where trust is the default, not a
            feature you have to dig for.
          </p>
        </div>
      </section>

      {/* values */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">What we stand for</h2>
        <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <div key={v.title} className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-sm font-bold text-accent">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-black/65">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* the anti-gimmick section */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold">No gimmicks. Here’s what we removed — and why.</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-black/70">
          Most of online travel is theater. Each “feature” below exists for one reason: to make the price harder to
          compare and easier to inflate. Confusing <em>by design</em>. We took them all out.
        </p>
        <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
          {GIMMICKS.map((g) => (
            <div key={g.name} className="flex gap-4 py-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/[0.04]" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3261e" strokeWidth="2.4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </span>
              <p className="text-[15px] leading-relaxed text-black/75">
                <strong className="text-black">{g.name}.</strong> {g.truth}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-black/80">
          Strip all of it away and what’s left is simple: the hotel’s rate, one flat fee, the same for everyone.{" "}
          <strong>Simple is the point. Simple is how you know it’s honest.</strong>
        </p>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-xl bg-accent-tint/50 p-7">
        <h2 className="text-lg font-semibold">See it for yourself</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">
          Search any city and you’ll see one all-in price — and it’s the same one we’d show anyone. Curious how we keep
          the lights on without the tricks? We wrote that down too.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/search" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Find a hotel
          </Link>
          <Link href="/disclosure" className="rounded-full border border-accent/30 px-6 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/60">
            How we make money
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: `About ${SITE_NAME}`,
            url: abs("/about"),
            about: { "@id": `${abs("/")}#organization` },
          }),
        }}
      />
    </div>
  );
}
