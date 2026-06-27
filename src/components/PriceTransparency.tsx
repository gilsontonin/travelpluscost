// The one section the big OTAs structurally can't show: how the price is built. Honest and
// POSITIONING-safe (no figures, no "lowest price" claim), and unique per page — which also helps
// these directory pages read as ours, not as templated near-duplicates.
export default function PriceTransparency({ name }: { name?: string }) {
  const points = [
    {
      t: "One flat fee",
      d: "The price is what the hotel charges us plus one small, flat service fee — the same for every guest.",
    },
    {
      t: "No surveillance pricing",
      d: "We never use your device, location or browsing history to decide what you pay.",
    },
    {
      t: "All-in, no surprises",
      d: "Taxes and known fees are shown up front. What you see is what you book.",
    },
  ];
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">How {name ? `${name}'s` : "our"} price works</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {points.map((p) => (
          <div key={p.t} className="rounded-2xl border border-black/[0.07] bg-card p-4 shadow-card">
            <p className="font-medium text-black">{p.t}</p>
            <p className="mt-1 text-sm leading-relaxed text-black/65">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
