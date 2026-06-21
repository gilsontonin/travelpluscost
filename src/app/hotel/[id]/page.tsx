import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllOahu, getOahuHotel } from "@/lib/oahu";
import RoomsPanel from "@/components/RoomsPanel";
import PhotoGallery from "@/components/PhotoGallery";

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
        <h1 className="text-2xl font-semibold">{hotel.name}</h1>
        <p className="text-sm text-black/55 mt-1">{[hotel.address, hotel.city].filter(Boolean).join(", ")}</p>
        <p className="text-sm mt-1 text-black/70">
          {hotel.rating ? `★ ${(hotel.rating / 2).toFixed(1)}` : ""}
          {hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()} reviews` : ""}
          {hotel.stars ? ` · ${hotel.stars}-star hotel` : ""}
        </p>
      </div>

      {/* description + promise */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {hotel.description ? (
            <p className="text-black/70 leading-relaxed line-clamp-6">{hotel.description}</p>
          ) : null}

          {hotel.facilities.length ? (
            <div className="mt-6">
              <h2 className="font-semibold mb-3">What this place offers</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.facilities.slice(0, 14).map((f) => (
                  <span key={f} className="text-xs px-3 py-1.5 rounded-md bg-black/[0.04] text-black/70">
                    {f}
                  </span>
                ))}
                {hotel.facilities.length > 14 ? (
                  <span className="text-xs px-3 py-1.5 text-black/40">+{hotel.facilities.length - 14} more</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {hotel.checkin || hotel.checkout ? (
            <p className="mt-6 text-sm text-black/60">
              Check-in {hotel.checkin ?? "—"} · Check-out {hotel.checkout ?? "—"}
            </p>
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
        <RoomsPanel hotelId={hotel.id} />
      </Suspense>
    </div>
  );
}
