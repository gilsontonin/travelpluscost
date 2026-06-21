import type { ReactNode } from "react";
import type { OahuHotel } from "@/lib/oahu";
import { detectAmenities } from "@/lib/oahu";

const ICON: Record<string, ReactNode> = {
  award: (
    <>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      <circle cx="12" cy="8" r="6" />
    </>
  ),
  beach: (
    <>
      <path d="M22 12a10.06 10.06 0 0 0-20 0Z" />
      <path d="M12 12v8a2 2 0 0 0 4 0" />
      <path d="M12 2v1" />
    </>
  ),
  sparkle: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />,
  pool: (
    <>
      <path d="M2 13c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" />
      <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" />
      <path d="M7 14V6a2 2 0 0 1 4 0" />
      <path d="M13 14V6a2 2 0 0 1 4 0" />
    </>
  ),
  star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" />,
};

function highlightsFor(h: OahuHotel): { title: string; desc: string; icon: string }[] {
  const am = detectAmenities(h.facilities);
  const out: { title: string; desc: string; icon: string }[] = [];

  // Sentiment-driven (like Expedia's "Top-rated …" / "Guests loved …").
  const topCat = h.sentiment?.categories?.slice().sort((a, b) => b.rating - a.rating)[0];
  if (topCat && topCat.rating >= 9.3) {
    const name = topCat.name.toLowerCase();
    out.push({ title: `Top-rated ${name}`, desc: `Guests rate ${name} ${topCat.rating.toFixed(1)}/10.`, icon: "sparkle" });
  }

  if ((h.rating ?? 0) >= 9)
    out.push({ title: "Guest favorite", desc: "Exceptional reviews from recent guests.", icon: "award" });
  if (am.includes("Beachfront")) out.push({ title: "By the beach", desc: "Steps from the sand.", icon: "beach" });
  if ((h.stars ?? 0) >= 5) out.push({ title: "Luxury stay", desc: "A top-tier 5-star property.", icon: "sparkle" });
  if (am.includes("Pool")) out.push({ title: "Pool on site", desc: "Cool off without leaving.", icon: "pool" });

  const pro = h.sentiment?.pros?.[0];
  if (pro && out.length < 3) out.push({ title: "Guests loved it", desc: pro, icon: "star" });
  if (out.length < 2 && (h.reviewCount ?? 0) > 500)
    out.push({ title: "Well reviewed", desc: `${(h.reviewCount ?? 0).toLocaleString()} guest reviews.`, icon: "star" });
  return out.slice(0, 3);
}

export default function Highlights({ hotel }: { hotel: OahuHotel }) {
  const items = highlightsFor(hotel);
  if (!items.length) return null;
  return (
    <div className="mt-6 grid sm:grid-cols-3 gap-4 border-y border-black/[0.07] py-5">
      {items.map((it) => (
        <div key={it.title} className="flex gap-3">
          <span className="shrink-0 w-9 h-9 rounded-full bg-accent-tint grid place-items-center text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={it.icon === "sparkle" || it.icon === "star" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {ICON[it.icon]}
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
