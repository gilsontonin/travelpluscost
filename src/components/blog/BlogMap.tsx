import Link from "next/link";

// `::map <destination>` — the OTA "View on map" / "Show on map" pattern: a lightweight button to the
// search map, NOT a heavy embedded Leaflet map. Faster on mobile, and it sends the reader straight to
// the live, mappable inventory at one honest price.
export default function BlogMap({ dest }: { dest: string }) {
  return (
    <Link
      href={`/search?destination=${encodeURIComponent(dest)}&adults=2`}
      className="my-6 flex items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent-tint/30 px-4 py-3.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/60"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zM9 3v15M15 6v15" />
      </svg>
      View {dest} stays on the map
    </Link>
  );
}
