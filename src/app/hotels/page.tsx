import type { Metadata } from "next";
import Link from "next/link";
import { statesSorted, geoTotals } from "@/lib/geo";
import { SITE_NAME, abs } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Find Hotels Across the United States | One Honest Price" },
  description:
    "Browse hotels in every U.S. state and city on one honest price — the room rate plus one small flat fee, the same for everyone, never based on your data.",
  alternates: { canonical: "/hotels" },
};

// Browse index: the top of the hub graph. Links to all 50+ state hubs (and their top cities), so
// every city hub is reachable in 1–2 clicks. Static — reads content/geo-index.json, no DB call.
export const revalidate = 86400;

export default function HotelsIndexPage() {
  const states = statesSorted();
  const totals = geoTotals();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden>›</span>
        <span className="text-black/70">Hotels</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Find hotels across the United States</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-black/70">
          Browse <strong>{totals.hotels.toLocaleString()} hotels</strong> in{" "}
          {totals.cities.toLocaleString()} cities across {totals.states} states — all on one honest price:
          the room rate plus one small flat fee, the same for everyone, never based on your data.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="sr-only">Hotels by state</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((s) => (
            <div key={s.code}>
              <Link
                href={`/destinations/${s.slug}`}
                className="text-[15px] font-semibold text-black hover:text-accent"
              >
                Hotels in {s.name}
              </Link>
              <p className="mt-0.5 text-xs text-black/50">
                {s.hotels.toLocaleString()} hotels · {s.cityCount.toLocaleString()} cities
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-black/60">
                {s.topCities.slice(0, 5).map((c, i) => (
                  <span key={c.slug}>
                    <Link href={`/hotels/${c.slug}`} className="hover:text-accent hover:underline">
                      {c.name}
                    </Link>
                    {i < Math.min(4, s.topCities.length - 1) ? <span className="text-black/25"> ·</span> : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-xl bg-accent-tint/50 p-6">
        <h2 className="text-lg font-semibold">One price for everyone</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">
          Most travel sites quietly mark up your room — and some change the price based on your device,
          location or browsing history. We don&apos;t. You pay what the hotel charges us plus one small flat
          fee, and it&apos;s the same number for every traveler on every screen. No surveillance pricing. Ever.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { name: "Home", path: "/" },
              { name: "Hotels", path: "/hotels" },
            ].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Hotels by state on ${SITE_NAME}`,
            itemListElement: states.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: abs(`/destinations/${s.slug}`),
              name: `Hotels in ${s.name}`,
            })),
          }),
        }}
      />
    </div>
  );
}
