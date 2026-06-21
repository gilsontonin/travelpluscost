import type { OahuHotel } from "@/lib/oahu";
import { detectAmenities } from "@/lib/oahu";

function highlightsFor(h: OahuHotel): { title: string; desc: string }[] {
  const am = detectAmenities(h.facilities);
  const out: { title: string; desc: string }[] = [];
  if ((h.rating ?? 0) >= 9) out.push({ title: "Guest favorite", desc: "Exceptional reviews from recent guests." });
  if (am.includes("Beachfront")) out.push({ title: "By the beach", desc: "Steps from the sand." });
  if ((h.stars ?? 0) >= 5) out.push({ title: "Luxury stay", desc: "A top-tier 5-star property." });
  if (am.includes("Pool")) out.push({ title: "Pool on site", desc: "Cool off without leaving." });
  if (out.length < 2 && (h.reviewCount ?? 0) > 500)
    out.push({ title: "Well reviewed", desc: `${(h.reviewCount ?? 0).toLocaleString()} guest reviews.` });
  return out.slice(0, 3);
}

export default function Highlights({ hotel }: { hotel: OahuHotel }) {
  const items = highlightsFor(hotel);
  if (!items.length) return null;
  return (
    <div className="mt-6 grid sm:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.title} className="flex gap-3">
          <span className="shrink-0 w-9 h-9 rounded-full bg-accent-tint grid place-items-center text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-sm">{it.title}</p>
            <p className="text-xs text-black/55">{it.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
