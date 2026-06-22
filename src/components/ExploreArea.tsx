import MapView from "@/components/MapView";
import { nearbyList, fmtMiles, type Landmark } from "@/lib/distance";

export default function ExploreArea({
  name,
  lat,
  lng,
  address,
  city,
  landmarks = [],
}: {
  name?: string;
  lat: number | null;
  lng: number | null;
  address?: string;
  city?: string;
  landmarks?: Landmark[];
}) {
  if (lat == null || lng == null) return null;
  const nearby = nearbyList(lat, lng, landmarks, 5);
  return (
    <section id="location" className="mt-10 scroll-mt-32">
      <h2 className="text-xl font-semibold mb-3">{name ? `Things to do near ${name}` : "Explore the area"}</h2>
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

      {nearby.length ? (
        <div className="mt-5">
          <h3 className="font-medium text-sm mb-2">What&apos;s nearby</h3>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 max-w-2xl">
            {nearby.map((n) => (
              <li key={n.name} className="flex items-center justify-between gap-3 text-sm border-b border-black/[0.06] pb-2">
                <span className="text-black/75 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/35 shrink-0">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {n.name}
                </span>
                <span className="text-black/55 tabular-nums shrink-0">{fmtMiles(n.miles)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-black/60">Straight-line distances.</p>
        </div>
      ) : null}
    </section>
  );
}
