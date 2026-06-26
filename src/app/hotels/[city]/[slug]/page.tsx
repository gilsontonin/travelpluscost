import type { Metadata } from "next";
import { Suspense, cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllOahu, classifyType } from "@/lib/oahu";
import { getHotelContent } from "@/lib/hotelContent";
import { getDirectoryHotel } from "@/lib/directory";
import { extractHotelId, hotelHref, slugify } from "@/lib/hotelUrl";
import RoomsPanel from "@/components/RoomsPanel";
import PropertyNav from "@/components/PropertyNav";
import PropertySearchBar from "@/components/PropertySearchBar";
import ShareSaveButtons from "@/components/ShareSaveButtons";
import PriceCta from "@/components/PriceCta";
import PhotoGallery from "@/components/PhotoGallery";
import ViatorPackages from "@/components/ViatorPackages";
import Highlights from "@/components/Highlights";
import Reviews from "@/components/Reviews";
import ExploreArea from "@/components/ExploreArea";
// AboutNeighborhood (OSM/OSRM "About the neighborhood") is BACKLOGGED — built but unwired until we
// precompute its data to our DB (public Overpass is too slow for a live call). See lib/neighborhood.ts.
import ExpandableText from "@/components/ExpandableText";
import AmenityGroups from "@/components/AmenityGroups";
import PopularAmenities from "@/components/PopularAmenities";
import PropertyFaq from "@/components/PropertyFaq";
import PoliciesInfo from "@/components/PoliciesInfo";
import PriceTransparency from "@/components/PriceTransparency";
import SimilarHotels from "@/components/SimilarHotels";
import TrackView from "@/components/TrackView";
import CityHotels from "@/components/CityHotels";
import { nearbyLabel } from "@/lib/distance";
import { REGIONS } from "@/lib/regions";
import { stateName, stateSlugFromCode } from "@/lib/states";
import { siblingCities } from "@/lib/geo";
import { SITE_NAME } from "@/lib/site";
import { categorizeProperty, categorizeRoom } from "@/lib/amenityGroups";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://travelpluscost.com";

// Deduped per request: generateMetadata and the page both need the content; this fetches it once.
const getHotel = cache(getHotelContent);
const getDir = cache(getDirectoryHotel);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = extractHotelId(slug);
  const hotel = await getHotel(id);
  if (!hotel) return {};
  const dir = await getDir(id);
  const loc = [hotel.city || hotel.island, dir?.state].filter(Boolean).join(", ");
  const titleCore = loc ? `${hotel.name}, ${loc}` : hotel.name;
  // Freshness signal in the SERP title (Expedia/Booking style). Computed from the current date, so a
  // rebuild / ISR refresh rolls the year forward automatically. Brandless — Google shows the site name.
  const year = new Date().getFullYear();
  // Amenity-led meta description (Expedia-style): lead with the standout amenities, then location.
  const fac = (hotel.facilities ?? []).join(" | ").toLowerCase();
  const amen: string[] = [];
  if (/pool|swimming/.test(fac)) amen.push("a pool");
  if (/spa|sauna|massage/.test(fac)) amen.push("a spa");
  if (/fitness|gym/.test(fac)) amen.push("a fitness center");
  if (/restaurant|dining/.test(fac)) amen.push("an on-site restaurant");
  if (/free wi-?fi/.test(fac)) amen.push("free WiFi");
  if (/beach/.test(fac)) amen.push("beach access");
  if (/\bbar\b|lounge/.test(fac)) amen.push("a bar");
  if (/parking/.test(fac)) amen.push("parking");
  const raw = (hotel.description || "").replace(/\s+/g, " ").trim();
  let description: string;
  if (amen.length >= 2) {
    const top = amen.slice(0, 3);
    const list = top.length > 1 ? `${top.slice(0, -1).join(", ")} and ${top[top.length - 1]}` : top[0];
    description = `Enjoy ${list} at ${hotel.name}${loc ? ` in ${loc}` : ""}. One honest price — the rate plus one small flat fee, the same for everyone.`;
  } else if (raw) {
    description = raw;
  } else {
    description = `Compare ${hotel.name}${loc ? ` in ${loc}` : ""} — the room rate plus one small flat fee, the same price for everyone. No surveillance pricing.`;
  }
  description = description.length > 160 ? `${description.slice(0, 157).replace(/\s+\S*$/, "")}…` : description;
  // Canonical from the DIRECTORY name/city — the stable slug the sitemap and every internal link use.
  // The live LiteAPI name drifts (rentals get retitled), which made the page canonicalize away from the
  // sitemap URL ("non-canonical URL in sitemap"). The id resolves either slug; this keeps them in sync.
  const url = hotelHref({ id, name: dir?.name ?? hotel.name, city: dir?.city ?? hotel.city });
  return {
    title: { absolute: `${titleCore} | ${year} Rates & Reviews` },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${titleCore} · ${SITE_NAME}`,
      description,
      url,
      ...(hotel.image ? { images: [{ url: hotel.image, alt: hotel.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titleCore,
      description,
      ...(hotel.image ? { images: [hotel.image] } : {}),
    },
  };
}

// Pre-render the curated markets as static pages (instant). Every OTHER hotel (the 274k+ directory)
// renders on demand and is cached — ISR — so a page exists for any property without a giant build.
export function generateStaticParams() {
  return getAllOahu().map((h) => ({ city: slugify(h.city), slug: `${slugify(h.name)}-${h.id}` }));
}
export const revalidate = 3600;

export default async function HotelPage({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const { slug } = await params;
  const id = extractHotelId(slug);
  const hotel = await getHotel(id);
  if (!hotel) notFound();
  const dir = await getDir(id);
  // Self URL from the DIRECTORY name — matches the canonical + sitemap + internal links (the live
  // LiteAPI name drifts as listings get retitled, which would make these self-refs non-canonical).
  const selfHref = hotelHref({ id, name: dir?.name ?? hotel.name, city: dir?.city ?? hotel.city });
  // Landmarks / "nearby" only exist for our curated markets; non-curated hotels degrade gracefully.
  const region = REGIONS.find((r) => r.name.toLowerCase() === (hotel.island || "").toLowerCase());
  const landmarks = region?.landmarks ?? [];
  const cityLabel = hotel.city ? `${hotel.city} hotels` : "Hotels";
  const searchHref = `/search?destination=${encodeURIComponent(hotel.city || "")}&adults=2`;
  // Breadcrumb up-links to the city hub (an indexable landing page), not the dynamic search page.
  const cityHubHref = hotel.city ? `/hotels/${slugify(hotel.city)}` : searchHref;
  // Full up-chain (property → city → STATE → /hotels) + lateral nearby-city links — a robust hub graph,
  // not a dead-end leaf. The state was the missing rung.
  const stateCode = dir?.state ?? null;
  const stateNm = stateCode ? stateName(stateCode) : null;
  const stateSlug = stateCode ? stateSlugFromCode(stateCode) : null;
  const stateHref = stateNm && stateSlug ? `/destinations/${stateSlug}` : null;
  const sib = hotel.city ? siblingCities(slugify(hotel.city), 10) : null;
  const propertyGroups = categorizeProperty(hotel.facilities ?? []);
  const roomGroups = categorizeRoom(Array.from(new Set((hotel.rooms ?? []).flatMap((r) => r.amenities ?? []))));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 pb-24 sm:py-6 lg:pb-6">
      <TrackView id={hotel.id} />

      {/* breadcrumbs + share/save */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-black/55">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span aria-hidden>›</span>
          <Link href="/hotels" className="hover:text-black">
            Hotels
          </Link>
          {stateHref && stateNm ? (
            <>
              <span aria-hidden>›</span>
              <Link href={stateHref} className="hover:text-black">
                {stateNm}
              </Link>
            </>
          ) : null}
          <span aria-hidden>›</span>
          <Link href={cityHubHref} className="hover:text-black">
            {cityLabel}
          </Link>
          <span aria-hidden>›</span>
          <span className="text-black/70 truncate max-w-[45%]">{hotel.name}</span>
        </nav>
        <ShareSaveButtons id={hotel.id} name={hotel.name} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { name: "Home", path: "/" },
              { name: "Hotels", path: "/hotels" },
              ...(stateHref && stateNm ? [{ name: `Hotels in ${stateNm}`, path: stateHref }] : []),
              { name: cityLabel, path: cityHubHref },
              { name: hotel.name, path: selfHref },
            ].map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.name,
              item: `${SITE_URL}${c.path}`,
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: hotel.name,
            url: `${SITE_URL}${selfHref}`,
            ...(hotel.images?.length ? { image: hotel.images.slice(0, 6) } : hotel.image ? { image: hotel.image } : {}),
            ...(hotel.address || hotel.city
              ? {
                  address: {
                    "@type": "PostalAddress",
                    ...(hotel.address ? { streetAddress: hotel.address } : {}),
                    ...(hotel.city ? { addressLocality: hotel.city } : {}),
                    addressCountry: "US",
                  },
                }
              : {}),
            ...(hotel.lat != null && hotel.lng != null
              ? { geo: { "@type": "GeoCoordinates", latitude: hotel.lat, longitude: hotel.lng } }
              : {}),
            ...(hotel.stars ? { starRating: { "@type": "Rating", ratingValue: hotel.stars } } : {}),
            ...(hotel.rating && hotel.reviewCount
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: hotel.rating,
                    reviewCount: hotel.reviewCount,
                    bestRating: 10,
                    worstRating: 1,
                  },
                }
              : {}),
          }),
        }}
      />

      {/* slim header above the photo: name + rating only (the rest moves below the gallery) */}
      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{hotel.name}</h1>
        {hotel.rating ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm">
            <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
              {hotel.rating.toFixed(1)}
            </span>
            {hotel.reviewCount ? (
              <span className="text-black/55">{hotel.reviewCount.toLocaleString()} reviews</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Choose dates → prices update in the rooms section. Above the gallery, Expedia-style. */}
      <div className="mt-4">
        <Suspense fallback={<div className="h-24 rounded-xl bg-black/[0.04] animate-pulse" />}>
          <PropertySearchBar hotelName={hotel.name} />
        </Suspense>
      </div>

      {/* gallery */}
      <PhotoGallery images={hotel.images} name={hotel.name} backHref={searchHref} />

      {/* property details (under the photo): stars, type, address, distance */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {hotel.stars ? (
            <span className="flex items-center gap-0.5 text-accent" aria-label={`${hotel.stars} star hotel`}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" />
                </svg>
              ))}
            </span>
          ) : null}
          {classifyType(hotel.hotelType).label ? (
            <span className="text-xs text-black/55 bg-black/[0.05] px-2 py-0.5 rounded-md">
              {classifyType(hotel.hotelType).label}
            </span>
          ) : null}
          {hotel.chain && !/^\s*(not available|n\/?a|none)\s*$/i.test(hotel.chain) ? (
            <span className="text-xs text-black/60">Part of {hotel.chain}</span>
          ) : null}
        </div>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-black/60">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            {[hotel.address, hotel.city].filter(Boolean).join(", ")}
            {nearbyLabel(hotel.lat, hotel.lng, landmarks) ? ` — ${nearbyLabel(hotel.lat, hotel.lng, landmarks)}` : ""}
          </span>
        </p>
      </div>

      {/* sticky section jump-nav */}
      <PropertyNav />

      {/* price + CTA high on the page (mobile/tablet; desktop has the sticky sidebar) */}
      <div className="lg:hidden">
        <Suspense fallback={<div className="mt-5 h-16 rounded-xl bg-black/[0.04] animate-pulse" />}>
          <PriceCta hotelId={hotel.id} />
        </Suspense>
      </div>

      <Highlights hotel={hotel} />

      <PopularAmenities facilities={hotel.facilities} />

      {/* description + promise */}
      <div id="overview" className="scroll-mt-32 mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {hotel.description ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">{hotel.name ? `About ${hotel.name}` : "About this property"}</h2>
              <ExpandableText text={hotel.description} />
            </div>
          ) : null}

          {/* Good to know — only the facts we actually have (no empty "—" cells) */}
          {hotel.checkin || hotel.checkout || hotel.petsAllowed != null || hotel.childAllowed != null ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Good to know about {hotel.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hotel.checkin ? <Fact label="Check-in" value={hotel.checkin} /> : null}
                {hotel.checkout ? <Fact label="Check-out" value={hotel.checkout} /> : null}
                {hotel.petsAllowed != null ? (
                  <Fact label="Pets" value={hotel.petsAllowed ? "Allowed" : "Not allowed"} />
                ) : null}
                {hotel.childAllowed != null ? (
                  <Fact label="Children" value={hotel.childAllowed ? "Welcome" : "Adults only"} />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit bg-white border border-black/5 rounded-lg p-5">
          <div className="rounded-md bg-accent-tint/60 p-3 text-sm text-black/70">
            <span className="font-medium text-accent">One honest price.</span> What the hotel charges us, plus one
            small flat fee — the same for everyone, never based on your data.
          </div>
          <a
            href="#rooms"
            className="mt-4 block text-center bg-accent text-white font-medium px-5 py-3 rounded-full hover:opacity-90 transition"
          >
            Choose a room
          </a>
        </aside>
      </div>

      {/* rooms + prices (live, client-loaded) */}
      <Suspense fallback={<div className="mt-10 h-40 rounded-lg bg-black/[0.04] animate-pulse" />}>
        <RoomsPanel hotelId={hotel.id} name={hotel.name} />
      </Suspense>

      <PriceTransparency name={hotel.name} />

      <Reviews hotel={hotel} />
      <ExploreArea name={hotel.name} lat={hotel.lat} lng={hotel.lng} address={hotel.address} city={hotel.city} landmarks={landmarks} />

      <SimilarHotels id={hotel.id} name={hotel.name} />
      <div className="mt-5 flex justify-center">
        <Link
          href={searchHref}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 px-6 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
          </svg>
          Compare similar properties
        </Link>
      </div>

      <AmenityGroups title={`${hotel.name} property amenities`} groups={propertyGroups} seeAllLabel="See all property amenities" />
      <AmenityGroups title={`${hotel.name} room amenities`} groups={roomGroups} seeAllLabel="See all room amenities" />

      <ViatorPackages lat={hotel.lat} lng={hotel.lng} />

      <PropertyFaq hotel={hotel} />

      <PoliciesInfo policies={hotel.policies} importantInfo={hotel.importantInfo} name={hotel.name} />

      <CityHotels city={hotel.city || ""} state={dir?.state} excludeId={hotel.id} />

      {/* Explore the area — lateral links out of the leaf: the city hub, nearby same-state cities, and
          the state hub. Keeps a property from being a dead end and feeds the hub graph both ways. */}
      {(sib && sib.cities.length) || stateHref ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">
            Explore {hotel.city ? `${hotel.city}, ` : ""}
            {stateNm ?? "the area"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {hotel.city ? (
              <Link
                href={cityHubHref}
                className="rounded-full border border-accent/30 bg-accent-tint/40 px-4 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/70"
              >
                All hotels in {hotel.city} →
              </Link>
            ) : null}
            {sib?.cities.map((c) => (
              <Link
                key={c.slug}
                href={`/hotels/${c.slug}`}
                className="rounded-full border border-black/12 px-4 py-1.5 text-sm text-black/70 transition hover:border-black/30 hover:text-black"
              >
                Hotels in {c.name}
              </Link>
            ))}
            {stateHref && stateNm ? (
              <Link
                href={stateHref}
                className="rounded-full border border-black/12 px-4 py-1.5 text-sm text-black/70 transition hover:border-black/30 hover:text-black"
              >
                All {stateNm} hotels →
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/[0.07] bg-white p-3">
      <p className="text-xs text-black/60">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
