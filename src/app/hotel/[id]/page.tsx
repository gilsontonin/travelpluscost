import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllOahu, getOahuHotel } from "@/lib/oahu";
import RoomsPanel from "@/components/RoomsPanel";
import PhotoGallery from "@/components/PhotoGallery";
import ViatorPackages from "@/components/ViatorPackages";
import Highlights from "@/components/Highlights";
import Reviews from "@/components/Reviews";
import ExploreArea from "@/components/ExploreArea";
import ExpandableText from "@/components/ExpandableText";
import AmenitiesSection from "@/components/AmenitiesSection";
import PoliciesInfo from "@/components/PoliciesInfo";

// Pre-render every ingested Oahu hotel as a static page (instant).
export function generateStaticParams() {
  return getAllOahu().map((h) => ({ id: h.id }));
}

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = getOahuHotel(id);
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:pb-6">
      <Link href="/search?destination=Oahu&adults=2" className="text-sm text-black/50 hover:text-black">
        ← Back to results
      </Link>

      {/* gallery */}
      <PhotoGallery images={hotel.images} name={hotel.name} />

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
          {hotel.hotelType ? (
            <span className="text-xs text-black/55 bg-black/[0.05] px-2 py-0.5 rounded-md">{hotel.hotelType}</span>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold mt-1.5">{hotel.name}</h1>
        <p className="text-sm text-black/55 mt-1 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {[hotel.address, hotel.city].filter(Boolean).join(", ")}
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
          {hotel.chain ? <span className="text-black/45">· Part of {hotel.chain}</span> : null}
        </div>
      </div>

      <Highlights hotel={hotel} />

      {/* description + promise */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {hotel.description ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">About this property</h2>
              <ExpandableText text={hotel.description} />
            </div>
          ) : null}

          <AmenitiesSection facilities={hotel.facilities} />

          {/* Good to know — facts we actually have from content */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Good to know</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Fact label="Check-in" value={hotel.checkin ?? "—"} />
              <Fact label="Check-out" value={hotel.checkout ?? "—"} />
              {hotel.petsAllowed != null ? (
                <Fact label="Pets" value={hotel.petsAllowed ? "Allowed" : "Not allowed"} />
              ) : null}
              {hotel.childAllowed != null ? (
                <Fact label="Children" value={hotel.childAllowed ? "Welcome" : "Adults only"} />
              ) : null}
            </div>
          </div>
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
        <RoomsPanel hotelId={hotel.id} />
      </Suspense>

      <Reviews hotel={hotel} />
      <ExploreArea lat={hotel.lat} lng={hotel.lng} address={hotel.address} city={hotel.city} />

      <ViatorPackages lat={hotel.lat} lng={hotel.lng} />

      <PoliciesInfo policies={hotel.policies} importantInfo={hotel.importantInfo} />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/[0.07] bg-white p-3">
      <p className="text-xs text-black/45">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
