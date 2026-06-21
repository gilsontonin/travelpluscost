import MapView from "@/components/MapView";

export default function ExploreArea({
  lat,
  lng,
  address,
  city,
}: {
  lat: number | null;
  lng: number | null;
  address?: string;
  city?: string;
}) {
  if (lat == null || lng == null) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">Explore the area</h2>
      <MapView center={[lat, lng]} zoom={14} markers={[{ lat, lng }]} height={300} />
      <p className="text-sm text-black/60 mt-2">{[address, city].filter(Boolean).join(", ")}</p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-accent"
      >
        Open in Google Maps ↗
      </a>
    </section>
  );
}
