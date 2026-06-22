import type { OahuHotel } from "@/lib/oahu";
import { reviewLabel } from "@/lib/format";

function fmtReviewDate(d: string | null): string {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function Reviews({ hotel }: { hotel: OahuHotel }) {
  const s = hotel.sentiment;
  const overall = reviewLabel(hotel.rating ?? undefined);
  const reviews = hotel.reviews ?? [];
  if (!overall && !s && !reviews.length) return null;
  const updated = hotel.reviewsUpdated
    ? new Date(hotel.reviewsUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">{hotel.name ? `${hotel.name} reviews` : "Guest reviews"}</h2>

      {overall ? (
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-[#1a7a4c] text-white text-lg font-bold px-3 py-1.5 rounded-md">{overall.score}</span>
          <div>
            <p className="font-semibold">{overall.label}</p>
            {hotel.reviewCount ? (
              <p className="text-sm text-black/55">
                {hotel.reviewCount.toLocaleString()} reviews
                {updated ? ` · updated ${updated}` : ""}
              </p>
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
                    <span className="text-black/60">–</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {reviews.length ? (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">What guests said</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.slice(0, 6).map((r, i) => (
              <article key={i} className="rounded-lg border border-black/[0.07] bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  {r.score != null ? (
                    <span className="bg-[#1a7a4c] text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                      {r.score.toFixed(1)}
                    </span>
                  ) : null}
                  <span className="text-sm font-medium truncate">{r.name}</span>
                  {r.type ? <span className="text-xs text-black/60 truncate">· {r.type}</span> : null}
                  {fmtReviewDate(r.date) ? (
                    <span className="text-xs text-black/60 ml-auto shrink-0">{fmtReviewDate(r.date)}</span>
                  ) : null}
                </div>
                {r.headline ? <p className="text-sm font-medium mb-1.5">{r.headline}</p> : null}
                {r.pros ? (
                  <p className="text-sm text-black/70 flex gap-2">
                    <span className="text-[#1a7a4c] mt-0.5">+</span>
                    <span>{r.pros}</span>
                  </p>
                ) : null}
                {r.cons ? (
                  <p className="text-sm text-black/70 flex gap-2 mt-1.5">
                    <span className="text-black/60 mt-0.5">–</span>
                    <span>{r.cons}</span>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-black/60">
            Verified guest reviews from completed stays{updated ? ` · updated ${updated}` : ""}.
          </p>
        </div>
      ) : null}
    </section>
  );
}
