import { getActivitiesNear } from "@/lib/viator";
import { money } from "@/lib/format";

// Viator "things to do" inside a hotel page — framework + stub data now (swap for the real Viator API
// later; card shape stays the same). Later: bundle hotel + activities into one cost-plus package.
export default function ViatorPackages({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const activities = getActivitiesNear(lat, lng);
  if (!activities.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Make it a trip — things to do nearby</h2>
      <p className="text-sm text-black/55 mt-1 mb-4">
        Tours &amp; activities via Viator. <span className="text-accent">Coming soon</span> — same honest pricing,
        no hidden markup.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {activities.map((a) => (
          <div key={a.id} className="rounded-lg border border-black/5 overflow-hidden bg-white">
            <div className="h-28 bg-gradient-to-br from-accent/20 to-accent-tint grid place-items-center text-accent text-xs font-semibold px-2 text-center">
              {a.category}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium leading-snug line-clamp-2">{a.title}</p>
              <p className="text-xs text-black/50 mt-1">
                ★ {a.rating} · {a.reviews.toLocaleString()} reviews · {a.durationHours}h
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold">from {money(a.price, a.currency)}</span>
                <span className="text-xs text-black/40 border border-black/10 rounded-md px-2 py-1">Add soon</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
