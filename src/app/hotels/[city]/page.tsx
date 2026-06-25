import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hotelsByCity, hotelsByCityFuzzy, cityHotelCount, rankHotels, directoryToCard, type DirectoryHotel } from "@/lib/directory";
import { slugify, hotelHref } from "@/lib/hotelUrl";
import { REGIONS } from "@/lib/regions";
import { siblingCities, popularCities } from "@/lib/geo";
import { SITE_NAME, abs } from "@/lib/site";
import { nearbyLabel } from "@/lib/distance";
import { getPrices } from "@/lib/rates";
import CityResults from "@/components/CityResults";
import HotelRail from "@/components/HotelRail";
import ViatorPackages from "@/components/ViatorPackages";

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
  fromPrice: number | null; // cheapest per-night among the top stays (tomorrow night) — H1 hook
}

// Deduped per request (generateMetadata + the page both load it). Resolve the slug back to a real
// city name via the directory: query with dashes-as-spaces (matches "las vegas" -> "Las Vegas"),
// then trust the data's own casing + most-common state for display/canonical.
const load = cache(async (slug: string): Promise<CityData | null> => {
  const name = slug.replace(/-/g, " ");
  let rows = await hotelsByCity(name, "us", 60);
  if (!rows.length) rows = await hotelsByCityFuzzy(slug, "us", 60); // punctuated names: "st-augustine" → "St. Augustine"
  if (!rows.length) return null;
  const city = rows[0].city || cityFromSlug(slug);
  const stateCounts: Record<string, number> = {};
  for (const r of rows) if (r.state) stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
  const state = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const count = await cityHotelCount(city, "us", state ?? undefined); // real city name, not the lossy slug
  const ranked = rankHotels(rows).filter((h) => h.thumbnail);

  // Indicative "from" price: cheapest per-night among the top stays for tomorrow night. Server-side +
  // ISR-cached daily; the rates client caches too. Omitted if unavailable — never blocks the page.
  let fromPrice: number | null = null;
  try {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const ci = d.toISOString().slice(0, 10);
    d.setDate(d.getDate() + 1);
    const co = d.toISOString().slice(0, 10);
    // Cap the live rate fetch: a slow LiteAPI response must NEVER make the hub uncrawlable (Semrush /
    // Googlebot time out around 3-5s, and this call can take 4-6s). On timeout we skip the indicative
    // "from" price — it's already optional — so the page always renders fast.
    const prices = await Promise.race([
      getPrices(ranked.slice(0, 12).map((h) => h.id), ci, co, 2),
      new Promise<Awaited<ReturnType<typeof getPrices>>>((resolve) => setTimeout(() => resolve({}), 1500)),
    ]);
    const perNight = Object.values(prices)
      .map((p) => Math.round((p.allIn ?? p.amount) / p.nights))
      .filter((n) => n > 0);
    if (perNight.length) fromPrice = Math.min(...perNight);
  } catch {
    /* rates optional */
  }

  return { rows, ranked, city, state, count, fromPrice };
});

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const loc = [data.city, data.state].filter(Boolean).join(", ");
  const year = new Date().getFullYear();
  const n = data.count >= 10 ? `${Math.floor(data.count / 10) * 10}+ ` : "";
  return {
    title: { absolute: `Hotels in ${loc}${data.fromPrice ? ` from $${data.fromPrice}` : ""} | ${year} Prices, Photos & Reviews` },
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
  const { ranked, city, state, count, fromPrice } = data;
  const loc = [city, state].filter(Boolean).join(", ");
  const top = ranked.slice(0, 48);
  const searchHref = `/search?destination=${encodeURIComponent(city)}&adults=2`;
  const canonical = `/hotels/${slugify(city)}`;
  const countLabel = count >= 10 ? `${(Math.floor(count / 10) * 10).toLocaleString()}+` : String(count);

  // Light per-city uniqueness (from the rows we already fetched — no extra queries): the actual
  // top-rated property, whether the city has resorts, and the region anchor for a "near X" line.
  // This is what keeps each hub from reading as a thin, templated doorway page.
  const topRated = ranked[0];
  const region = REGIONS.find((r) => r.cities.some((c) => slugify(c) === slugify(city)));
  const anchor = region?.anchor;
  const hasResorts = data.rows.some((h) => (h.property_type ?? "").toLowerCase() === "resort");
  const faqs: { q: string; a: string }[] = [
    {
      q: `How many hotels are in ${city}?`,
      a: `There are ${countLabel} hotels in ${loc} on ${SITE_NAME}${hasResorts ? ", including beachfront resorts and smaller boutique stays" : ""}.${
        topRated?.rating
          ? ` The highest-rated right now is ${topRated.name}, with a ${topRated.rating.toFixed(1)}/10 guest score${
              topRated.review_count ? ` from ${topRated.review_count.toLocaleString()} reviews` : ""
            }.`
          : ""
      }`,
    },
    {
      q: `How does ${SITE_NAME} keep ${city} hotels cheaper?`,
      a: `You pay what the hotel charges us plus one small flat fee — the same price for every traveler, on every device. We never raise the price based on your location, browser or history. That flat fee is usually less than the hidden markup most travel sites bake in.`,
    },
    {
      q: `Are taxes and resort fees included in the price?`,
      a: `Yes. Every room shows the all-in price — the nightly rate plus taxes and known fees — so the total you see is the total you pay. Where a ${city} hotel charges a resort or property fee, it's already in that number.`,
    },
    {
      q: `Can I cancel a ${city} hotel booking?`,
      a: `Many ${city} hotels offer fully refundable rates. When a room can be cancelled for free we label it "Fully refundable", so you can spot a flexible rate at a glance.`,
    },
  ];
  if (anchor && region) {
    faqs.push({
      q: `How far are ${city} hotels from ${anchor}?`,
      a: `Most ${city} stays sit within a few miles of ${anchor}. Each hotel page shows the exact distance to ${anchor} and other ${region.label} landmarks, so you can choose by location.`,
    });
  }

  // Same-state cross-links + the state hub — builds a dense hub graph (state ⇄ city) so every hub is
  // crawlable, not orphaned. Falls back to nothing for the rare city we can't place in a state.
  const sib = siblingCities(slugify(city), 12);

  // Search-page card model: directory rows -> CardHotel. Enrich with the distance-to-anchor line
  // for curated markets (so cards read "0.4 mi from Waikiki Beach", not just the city name again).
  const landmarks = region?.landmarks ?? [];
  // "Popular" = most-reviewed (most-booked) among the stays we actually surface — honest social proof,
  // not urgency. Scoped to the shown set so the badge reliably lands on cards the visitor sees.
  const popularIds = new Set(
    [...top.slice(0, 18)]
      .filter((h) => (h.review_count ?? 0) > 0)
      .sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
      .slice(0, 5)
      .map((h) => h.id),
  );
  const cards = top.map((h) => {
    const c = directoryToCard(h);
    if (landmarks.length && h.lat != null && h.lng != null) c.nearby = nearbyLabel(h.lat, h.lng, landmarks);
    c.popular = popularIds.has(h.id);
    return c;
  });

  // Themed, crawlable hotel rails below the inventory — each is a distinct subset that targets a
  // related query ("luxury/resorts/aparthotels in {city}") and links real hotels (the SEO-module
  // pattern). Built from the rows we already fetched; only rails with a real set (≥4) render.
  const pType = (h: DirectoryHotel) => (h.property_type ?? "").toLowerCase();
  const themedRails = [
    { title: `Luxury hotels in ${city}`, subtitle: "4-star and up", rows: ranked.filter((h) => (h.stars ?? 0) >= 4) },
    { title: `Resorts in ${city}`, subtitle: "pools, dining and more on site", rows: ranked.filter((h) => pType(h) === "resort") },
    { title: `Aparthotels in ${city}`, subtitle: "kitchens and extra space", rows: ranked.filter((h) => pType(h) === "aparthotel") },
    { title: `Most-reviewed hotels in ${city}`, subtitle: "the most-booked, by review volume", rows: [...ranked].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0)) },
  ].filter((t) => t.rows.length >= 4);

  // City center = centroid of the hotels we have → "Things to do in {city}" via Viator (real data).
  const geoRows = data.rows.filter((h) => h.lat != null && h.lng != null);
  const center = geoRows.length
    ? {
        lat: geoRows.reduce((s, h) => s + (h.lat as number), 0) / geoRows.length,
        lng: geoRows.reduce((s, h) => s + (h.lng as number), 0) / geoRows.length,
      }
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-28">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden>›</span>
        <Link href="/hotels" className="hover:text-black">Hotels</Link>
        {sib ? (
          <>
            <span aria-hidden>›</span>
            <Link href={`/destinations/${sib.state.slug}`} className="hover:text-black">{sib.state.name}</Link>
          </>
        ) : null}
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
              { name: "Hotels", path: "/hotels" },
              ...(sib ? [{ name: `Hotels in ${sib.state.name}`, path: `/destinations/${sib.state.slug}` }] : []),
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

      {/* Compact header — H1 + real per-city facts + one value line; inventory leads (no wall of text). */}
      <header className="mt-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Hotels in {loc}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-black/60">
          <span>
            <strong className="text-black">{countLabel}</strong> hotels
          </span>
          {fromPrice ? (
            <span>
              from <strong className="text-black">${fromPrice}</strong>/night
            </span>
          ) : null}
          {topRated?.rating ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="rounded bg-[#2e7d46] px-1.5 py-0.5 text-xs font-semibold text-white">
                {topRated.rating.toFixed(1)}
              </span>
              top guest score
            </span>
          ) : null}
          {anchor ? <span>Near {anchor}</span> : null}
        </div>
      </header>

      {cards.length ? (
        <CityResults cards={cards} city={city} countLabel={countLabel} searchHref={searchHref} />
      ) : (
        <p className="mt-6 text-black/60">
          We&apos;re still adding photos for {city}.{" "}
          <Link href={searchHref} className="font-medium text-accent hover:underline">Search all hotels in {city}</Link>.
        </p>
      )}

      {/* themed, crawlable hotel rails — query-targeted SEO depth + internal links */}
      {themedRails.map((t) => (
        <HotelRail
          key={t.title}
          title={t.title}
          subtitle={t.subtitle}
          hotels={t.rows.slice(0, 10).map(directoryToCard)}
          seeAllHref={searchHref}
        />
      ))}

      {/* things to do — real Viator activities near the city center (self-hides if none) */}
      {center ? <ViatorPackages lat={center.lat} lng={center.lng} /> : null}

      {/* price promise */}
      <section className="mt-12 rounded-xl bg-accent-tint/50 p-6">
        <h2 className="text-lg font-semibold">Why {city} hotels cost less here</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">
          Most travel sites quietly mark up your room — and some change the price based on your device, location or
          browsing history. We don&apos;t. You pay what the hotel charges us plus one small flat fee, and it&apos;s the
          same number for every traveler on every screen. No surveillance pricing. Ever.
        </p>
      </section>

      {/* FAQ — useful, mostly per-city answers; carries FAQPage schema */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Hotels in {city}: common questions</h2>
        <div className="mt-3 border-y border-black/10">
          {faqs.map((f, i) => (
            <details key={i} className="group border-b border-black/10 py-3 last:border-b-0" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 text-black/40 transition group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      {/* "you may also like" — flat, crawlable hotel text-links (Trivago pattern). Dense internal
          links to real hotel pages, distinct from the visual rails above. */}
      {ranked.length > 6 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">More hotels in {city}</h2>
          <p className="mt-1 text-sm text-black/55">Other top-rated stays you might like.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {ranked.slice(0, 30).map((h) => (
              <Link
                key={h.id}
                href={hotelHref({ id: h.id, name: h.name, city: h.city ?? city })}
                className="text-sm text-black/65 hover:text-accent hover:underline"
              >
                {h.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* same-state cross-links — dense hub graph (city ⇄ sibling cities ⇄ state hub) */}
      {sib && sib.cities.length ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">More hotels in {sib.state.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sib.cities.map((c) => (
              <Link
                key={c.slug}
                href={`/hotels/${c.slug}`}
                className="rounded-full border border-black/12 px-4 py-1.5 text-sm text-black/70 transition hover:border-black/30 hover:text-black"
              >
                Hotels in {c.name}
              </Link>
            ))}
            <Link
              href={`/destinations/${sib.state.slug}`}
              className="rounded-full border border-accent/30 bg-accent-tint/40 px-4 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/70"
            >
              All {sib.state.name} hotels →
            </Link>
          </div>
        </section>
      ) : null}

      {/* popular destinations — national interlink cluster + browse up-link (Expedia footer pattern) */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Popular destinations</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularCities(24)
            .filter((c) => c.slug !== slugify(city))
            .slice(0, 18)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/hotels/${c.slug}`}
                className="rounded-full border border-black/12 px-4 py-1.5 text-sm text-black/70 transition hover:border-black/30 hover:text-black"
              >
                Hotels in {c.name}
              </Link>
            ))}
          <Link
            href="/hotels"
            className="rounded-full border border-accent/30 bg-accent-tint/40 px-4 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/70"
          >
            Browse all U.S. destinations →
          </Link>
        </div>
      </section>
    </div>
  );
}
