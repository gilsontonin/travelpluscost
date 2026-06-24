import Link from "next/link";

// `::areas <dest>` — the Booking "Top cities" pattern, honest: real areas with LIVE directory counts.
// Counts are pre-fetched server-side (cityHotelCount); areas with no stays are dropped by the page.
export default function BlogAreas({ dest, areas }: { dest: string; areas: { city: string; count: number }[] }) {
  if (!areas.length) return null;
  return (
    <figure className="my-6">
      <figcaption className="mb-2 text-sm font-semibold text-black">Where to stay in {dest}, by area</figcaption>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {areas.map((a) => (
          <Link
            key={a.city}
            href={`/search?destination=${encodeURIComponent(a.city)}&adults=2`}
            className="rounded-xl border border-black/[0.08] p-3 transition hover:border-accent/40 hover:bg-accent-tint/30"
          >
            <div className="text-sm font-semibold text-black">{a.city}</div>
            <div className="text-xs text-black/55">{a.count.toLocaleString()} stays</div>
          </Link>
        ))}
      </div>
    </figure>
  );
}
