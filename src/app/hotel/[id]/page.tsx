import type { Metadata } from "next";
import { Suspense, cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllOahu, classifyType } from "@/lib/oahu";
import { getHotelContent } from "@/lib/hotelContent";
import RoomsPanel from "@/components/RoomsPanel";
import PropertyNav from "@/components/PropertyNav";
import PropertySearchBar from "@/components/PropertySearchBar";
import ShareSaveButtons from "@/components/ShareSaveButtons";
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
import { nearbyLabel } from "@/lib/distance";
import { REGIONS } from "@/lib/regions";
import { SITE_NAME } from "@/lib/site";
import { categorizeProperty, categorizeRoom } from "@/lib/amenityGroups";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://travelpluscost.com";

// Deduped per request: generateMetadata and the page both need the content; this fetches it once.
const getHotel = cache(getHotelContent);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getHotel(id);
  if (!hotel) return {};
  const loc = hotel.city || hotel.island || "";
  const titleCore = loc ? `${hotel.name}, ${loc}` : hotel.name;
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
  const url = `/hotel/${id}`;
  return {
    title: titleCore,
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
  return getAllOahu().map((h) => ({ id: h.id }));
}
export const revalidate = 3600;

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await getHotel(id);
  if (!hotel) notFound();
  // Landmarks / "nearby" only exist for our curated markets; non-curated hotels degrade gracefully.
  const region = REGIONS.find((r) => r.name.toLowerCase() === (hotel.island || "").toLowerCase());
  const landmarks = region?.landmarks ?? [];
  const cityLabel = hotel.city ? `${hotel.city} hotels` : "Hotels";
  const searchHref = `/search?destination=${encodeURIComponent(hotel.city || "")}&adults=2`;
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
          <Link href={searchHref} className="hover:text-black">
            {cityLabel}
          </Link>
          <span aria-hidden>›</span>
          <span className="text-black/70 truncate max-w-[60%]">{hotel.name}</span>
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
              { name: cityLabel, path: searchHref },
              { name: hotel.name, path: `/hotel/${hotel.id}` },
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
            url: `${SITE_URL}/hotel/${hotel.id}`,
            ...(hotel.image ? { image: hotel.image } : {}),
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

      {/* header */}
      <div className="mt-5">
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
        </div>
        <h1 className="text-2xl font-semibold mt-1.5">{hotel.name}</h1>
        <p className="text-sm text-black/55 mt-1 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {[hotel.address, hotel.city].filter(Boolean).join(", ")}
          {nearbyLabel(hotel.lat, hotel.lng, landmarks) ? (
            <span className="text-black/60">· {nearbyLabel(hotel.lat, hotel.lng, landmarks)}</span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
          {hotel.rating ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                {hotel.rating.toFixed(1)}
              </span>
              {hotel.reviewCount ? (
                <span className="text-black/55">{hotel.reviewCount.toLocaleString()} reviews</span>
              ) : null}
            </span>
          ) : null}
          {hotel.chain && !/^\s*(not available|n\/?a|none)\s*$/i.test(hotel.chain) ? (
            <span className="text-black/60">· Part of {hotel.chain}</span>
          ) : null}
        </div>
      </div>

      {/* Choose dates → prices update in the rooms section. Above the gallery, Expedia-style. */}
      <div className="mt-4">
        <Suspense fallback={<div className="h-24 rounded-xl bg-black/[0.04] animate-pulse" />}>
          <PropertySearchBar hotelName={hotel.name} />
        </Suspense>
      </div>

      {/* gallery */}
      <PhotoGallery images={hotel.images} name={hotel.name} backHref={searchHref} />

      {/* sticky section jump-nav */}
      <PropertyNav />

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
            className="mt-4 block text-center bg-accent text-white font-medium px-5 py-3 rounded-lg hover:opacity-90 transition"
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
