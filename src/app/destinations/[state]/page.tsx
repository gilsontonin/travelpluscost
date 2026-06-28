import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stateBySlug, allStateSlugs } from "@/lib/geo";
import { hotelsByStates, rankHotels, directoryToCard } from "@/lib/directory";
import { SITE_NAME, abs, clampDesc } from "@/lib/site";
import HotelRow from "@/components/HotelRow";

const getState = cache((slug: string) => stateBySlug(slug));

export function generateStaticParams() {
  return allStateSlugs().map((state) => ({ state }));
}
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state: slug } = await params;
  const st = getState(slug);
  if (!st) return {};
  const year = new Date().getFullYear();
  const top = st.cities.slice(0, 3).map((c) => c.name).join(", ");
  return {
    title: { absolute: `Hotels in ${st.name} | ${year} Rates & Reviews` },
    description: clampDesc(
      `Compare ${st.hotels.toLocaleString()} hotels across ${st.cityCount} ${st.name} cities — one honest price: the rate plus one small flat fee, the same for everyone.`,
    ),
    alternates: { canonical: `/destinations/${st.slug}` },
    openGraph: { type: "website", title: `Hotels in ${st.name} · ${SITE_NAME}`, url: `/destinations/${st.slug}` },
  };
}

export default async function StateHubPage({ params }: { params: Promise<{ state: string }> }) {
  const { state: slug } = await params;
  const st = getState(slug);
  if (!st) notFound();

  // Real top hotels in the state (live directory) — keeps the page substantial, not just a link list.
  const rows = await hotelsByStates([st.code], 24);
  const cards = rankHotels(rows)
    .filter((h) => h.thumbnail)
    .slice(0, 12)
    .map(directoryToCard);

  const topNames = st.cities.slice(0, 3).map((c) => c.name);
  const topList =
    topNames.length > 1 ? `${topNames.slice(0, -1).join(", ")} and ${topNames[topNames.length - 1]}` : topNames[0] ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden>›</span>
        <Link href="/hotels" className="hover:text-black">Hotels</Link>
        <span aria-hidden>›</span>
        <span className="text-black/70">{st.name}</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Hotels in {st.name}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-black/70">
          Compare <strong>{st.hotels.toLocaleString()} hotels</strong> across {st.cityCount} cities in {st.name}
          {topList ? <> — from {topList} to smaller towns</> : null} — all on one honest price: the room rate plus
          one small flat fee, the same for everyone, never based on your data.
        </p>
      </header>

      {cards.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Top-rated hotels in {st.name}</h2>
          <div className="flex flex-col gap-3 sm:gap-4">
            {cards.map((c, i) => (
              <HotelRow key={c.id} hotel={c} query="adults=2" awaitingDates priority={i < 2} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">All {st.name} destinations</h2>
        <p className="mt-1 text-xs text-black/60">{st.cityCount.toLocaleString()} cities</p>
        <div className="mt-4 columns-2 gap-6 sm:columns-3 lg:columns-4">
          {st.cities.map((c) => (
            <Link
              key={c.slug}
              href={`/hotels/${c.slug}`}
              className="block break-inside-avoid py-1 text-sm text-black/70 hover:text-accent"
            >
              {c.name} <span className="text-black/60">({c.count})</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-xl bg-accent-tint/50 p-6">
        <h2 className="text-lg font-semibold">Why {st.name} hotels cost less here</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">
          You pay what the hotel charges us plus one small flat fee — the same number for every traveler on every
          screen. No markup based on your device, location or history. No surveillance pricing. Ever.
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
              { name: st.name, path: `/destinations/${st.slug}` },
            ].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
          }),
        }}
      />
    </div>
  );
}
