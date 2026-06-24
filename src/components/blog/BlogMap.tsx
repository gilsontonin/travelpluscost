import Link from "next/link";
import MapView from "@/components/MapView";
import { hotelHref } from "@/lib/hotelUrl";
import type { CardHotel } from "@/lib/hotels";

// `::map <destination>` — a right-sized interactive map of real hotels in an area (our Stay22 equivalent).
// Server component: computes markers + center from the pre-fetched hotels; MapView loads Leaflet client-only.
export default function BlogMap({ dest, hotels }: { dest: string; hotels: CardHotel[] }) {
  const pts = hotels.filter((h) => h.lat != null && h.lng != null);
  if (pts.length < 2) return null;
  const center: [number, number] = [
    pts.reduce((s, h) => s + (h.lat as number), 0) / pts.length,
    pts.reduce((s, h) => s + (h.lng as number), 0) / pts.length,
  ];
  const markers = pts.map((h) => ({ lat: h.lat as number, lng: h.lng as number, id: h.id, href: hotelHref(h) }));
  return (
    <figure className="my-6">
      <figcaption className="mb-2 text-sm font-semibold text-black">Where to stay in {dest}: the map</figcaption>
      <MapView center={center} zoom={11} markers={markers} height={360} />
      <Link
        href={`/search?destination=${encodeURIComponent(dest)}&adults=2`}
        className="mt-2 inline-block text-sm font-semibold text-accent hover:underline"
      >
        See these {dest} stays and live prices →
      </Link>
    </figure>
  );
}
