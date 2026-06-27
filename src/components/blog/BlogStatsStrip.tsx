// Inventory stats strip — the OTA "trust bar" under the search, but honest: real counts from our
// directory plus the brand differentiator (one flat fee, never surveillance pricing). No fabricated
// numbers, no scarcity. Server component (pure props, no client JS).
export default function BlogStatsStrip({ city, hotelCount, avgRating }: { city: string; hotelCount: number; avgRating: number | null }) {
  if (!hotelCount) return null;
  const stats: { n: string; label: string }[] = [
    { n: hotelCount.toLocaleString(), label: `hotels in ${city}` },
    ...(avgRating ? [{ n: avgRating.toFixed(1), label: "avg guest score, top picks" }] : []),
    { n: "1", label: "flat fee — the same price for everyone" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {stats.map((s) => (
        <div key={s.label} className="inline-flex items-baseline gap-1.5 rounded-xl border border-black/[0.08] bg-zinc-50 px-3 py-2">
          <span className="text-lg font-bold tracking-tight text-accent">{s.n}</span>
          <span className="whitespace-nowrap text-xs leading-tight text-black/55">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
