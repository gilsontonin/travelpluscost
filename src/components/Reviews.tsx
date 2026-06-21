import type { OahuHotel } from "@/lib/oahu";
import { reviewLabel } from "@/lib/format";

export default function Reviews({ hotel }: { hotel: OahuHotel }) {
  const s = hotel.sentiment;
  const overall = reviewLabel(hotel.rating ?? undefined);
  if (!overall && !s) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">Guest reviews</h2>

      {overall ? (
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-[#1a7a4c] text-white text-lg font-bold px-3 py-1.5 rounded-md">{overall.score}</span>
          <div>
            <p className="font-semibold">{overall.label}</p>
            {hotel.reviewCount ? (
              <p className="text-sm text-black/55">{hotel.reviewCount.toLocaleString()} reviews</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {s?.categories?.length ? (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6 max-w-2xl">
          {s.categories.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{c.name}</span>
                <span className="font-medium">{c.rating.toFixed(1)}</span>
              </div>
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a7a4c]" style={{ width: `${Math.min(100, c.rating * 10)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {s && (s.pros.length || s.cons.length) ? (
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          {s.pros.length ? (
            <div>
              <p className="text-sm font-medium mb-2">Guests loved</p>
              <ul className="space-y-1.5">
                {s.pros.map((p) => (
                  <li key={p} className="text-sm text-black/70 flex gap-2">
                    <span className="text-[#1a7a4c]">+</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {s.cons.length ? (
            <div>
              <p className="text-sm font-medium mb-2">Worth noting</p>
              <ul className="space-y-1.5">
                {s.cons.map((c) => (
                  <li key={c} className="text-sm text-black/70 flex gap-2">
                    <span className="text-black/40">–</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
