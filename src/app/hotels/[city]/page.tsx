import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hotelsByCity, cityHotelCount, rankHotels, type DirectoryHotel } from "@/lib/directory";
import { slugify } from "@/lib/hotelUrl";
import { REGIONS } from "@/lib/regions";
import { SITE_NAME, abs } from "@/lib/site";
import HotelGridCard from "@/components/HotelGridCard";

// Title-case a city slug for display when the directory has no row to read the real casing from.
function cityFromSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CityData {
  rows: DirectoryHotel[];
  ranked: DirectoryHotel[];
  city: string;
  state: string | null;
  count: number;
}

// Deduped per request (generateMetadata + the page both load it). Resolve the slug back to a real
// city name via the directory: query with dashes-as-spaces (matches "las vegas" -> "Las Vegas"),
// then trust the data's own casing + most-common state for display/canonical.
const load = cache(async (slug: string): Promise<CityData | null> => {
  const name = slug.replace(/-/g, " ");
  const rows = await hotelsByCity(name, "us", 60);
  if (!rows.length) return null;
  const city = rows[0].city || cityFromSlug(slug);
  const stateCounts: Record<string, number> = {};
  for (const r of rows) if (r.state) stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
  const state = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const count = await cityHotelCount(name, "us", state ?? undefined);
  const ranked = rankHotels(rows).filter((h) => h.thumbnail);
  return { rows, ranked, city, state, count };
});

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const loc = [data.city, data.state].filter(Boolean).join(", ");
  const year = new Date().getFullYear();
  const n = data.count >= 10 ? `${Math.floor(data.count / 10) * 10}+ ` : "";
  return {
    title: { absolute: `Hotels in ${loc} | ${year} Prices, Photos & Reviews` },
    description: `Compare ${n}hotels in ${loc} on one honest price — the room rate plus one small flat fee, the same for everyone. No surveillance pricing, never based on your data.`,
    alternates: { canonical: `/hotels/${slugify(data.city)}` },
    openGraph: {
      type: "website",
      title: `Hotels in ${loc} · ${SITE_NAME}`,
      description: `Top-rated hotels in ${loc} at one honest price — the rate plus one small flat fee.`,
      url: `/hotels/${slugify(data.city)}`,
      ...(data.ranked[0]?.thumbnail ? { images: [{ url: data.ranked[0].thumbnail, alt: `Hotels in ${loc}` }] } : {}),
    },
  };
}

// Pre-render the curated markets (instant). Every other US city renders on demand and is cached (ISR).
export function generateStaticParams() {
  const cities = new Set<string>();
  for (const r of REGIONS) for (const c of r.cities) cities.add(slugify(c));
  return [...cities].map((city) => ({ city }));
}
export const revalidate = 86400; // a city's hotel set changes slowly

export default async function CityHubPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { ranked, city, state, count } = data;
  const loc = [city, state].filter(Boolean).join(", ");
  const top = ranked.slice(0, 24);
  const searchHref = `/search?destination=${encodeURIComponent(city)}&adults=2`;
  const canonical = `/hotels/${slugify(city)}`;
  const countLabel = count >= 10 ? `${(Math.floor(count / 10) * 10).toLocaleString()}+` : String(count);

  // Cross-link the other markets we cover — builds the hub graph (helps crawl + indexing).
  const otherCities = REGIONS.flatMap((r) => r.cities.map((c) => ({ name: c, label: r.label })))
    .filter((c) => slugify(c.name) !== slugify(city))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden>›</span>
        <span className="text-black/70">Hotels in {city}</span>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { name: "Home", path: "/" },
              { name: `Hotels in ${city}`, path: canonical },
            ].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
          }),
        }}
      />
      {top.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `Hotels in ${loc}`,
              itemListElement: top.map((h, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: abs(`/hotels/${slugify(h.city || city)}/${slugify(h.name)}-${h.id}`),
                name: h.name,
              })),
            }),
          }}
        />
      ) : null}

      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Hotels in {loc}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-black/70">
          Compare <strong>{countLabel} hotels in {city}</strong> on one honest price — the room rate plus one small
          flat fee, the same for everyone, never based on your data. Browse top-rated stays below, then pick your
          dates to see the live all-in price.
        </p>
      </header>

      {top.length ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {top.map((h, i) => (
              <HotelGridCard
                key={h.id}
                priority={i < 4}
                hotel={{
                  id: h.id,
                  name: h.name,
                  image: h.thumbnail ?? "",
                  city: h.city ?? city,
                  rating: h.rating,
                  reviewCount: h.review_count,
                  propertyType: h.property_type ?? "",
                }}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href={searchHref}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              See all {countLabel} hotels in {city}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <p className="mt-6 text-black/60">
          We&apos;re still adding photos for {city}.{" "}
          <Link href={searchHref} className="font-medium text-accent hover:underline">Search all hotels in {city}</Link>.
        </p>
      )}

      {/* price promise */}
      <section className="mt-12 rounded-xl bg-accent-tint/50 p-6">
        <h2 className="text-lg font-semibold">Why {city} hotels cost less here</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">
          Most travel sites quietly mark up your room — and some change the price based on your device, location or
          browsing history. We don&apos;t. You pay what the hotel charges us plus one small flat fee, and it&apos;s the
          same number for every traveler on every screen. No surveillance pricing. Ever.
        </p>
      </section>

      {/* cross-links to other markets */}
      {otherCities.length ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">More destinations</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {otherCities.map((c) => (
              <Link
                key={c.name}
                href={`/hotels/${slugify(c.name)}`}
                className="rounded-full border border-black/12 px-4 py-1.5 text-sm text-black/70 transition hover:border-black/30 hover:text-black"
              >
                Hotels in {c.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
