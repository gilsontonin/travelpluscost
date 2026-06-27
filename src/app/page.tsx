import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import SearchPanel from "@/components/SearchPanel";
import VibePromptPill from "@/components/VibePromptPill";
import HotelRail from "@/components/HotelRail";
import NearbyRail from "@/components/NearbyRail";
import SeasonalRail from "@/components/SeasonalRail";
import PopularDestinations from "@/components/PopularDestinations";
import ViatorPackages from "@/components/ViatorPackages";
import RecentlyViewed from "@/components/RecentlyViewed";
import { getAllHotels, toCard, toRail } from "@/lib/hotels";
import { REGIONS } from "@/lib/regions";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const search = (q: string) => `/search?destination=${encodeURIComponent(q)}&adults=2`;

export default function Home() {
  const all = getAllHotels();
  const cards = all.map(toCard);
  // Review-weighted (Bayesian) sort so a 1-review perfect-10 can't outrank a well-reviewed favourite
  // (M = prior weight, C = prior mean) — same idea as the search ranking.
  const weighted = (c: (typeof cards)[number]) => {
    const v = c.reviewCount ?? 0;
    const R = c.rating ?? 0;
    return (v * R + 25 * 8) / (v + 25);
  };
  const topRated = [...cards]
    .filter((c) => c.rating != null)
    .sort((a, b) => weighted(b) - weighted(a))
    .slice(0, 12);
  const beachfront = cards.filter((c) => c.amenities.includes("Beachfront")).slice(0, 12);
  const railAll = all.map(toRail);

  // markets we cover (the multi-region picker)
  const destinations = REGIONS.map((r) => {
    const hs = all.filter((h) => h.island.toLowerCase() === r.name.toLowerCase());
    const top = [...hs].filter((h) => h.rating != null).sort((a, b) => (b.rating as number) - (a.rating as number))[0] ?? hs[0];
    return { region: r, image: top?.image ?? "", count: hs.length };
  }).filter((d) => d.count > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:pt-14 pb-20">
      {/* hero (also the "how pricing works" anchor target for the nav) */}
      <div id="how" className="scroll-mt-24 text-center max-w-2xl mx-auto">
        <h1 className="text-balance text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          <span className="bg-gradient-to-r from-[#0066cc] to-[#3b9eff] bg-clip-text text-transparent">
            One honest price.
          </span>
          <br />
          The same for everyone.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg sm:text-xl text-muted leading-snug">
          What the hotel charges us, plus one small flat fee — never based on your data.
        </p>
      </div>

      <div className="mt-8">
        <SearchPanel />
        <VibePromptPill />
      </div>

      {/* honest trust strip */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
        {["Same price for everyone", "Never based on your data", "No fake discounts"].map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-accent">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {t}
          </span>
        ))}
      </div>

      <RecentlyViewed all={railAll} />

      <NearbyRail />

      <SeasonalRail />

      {/* destinations we cover */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Where to?</h2>
        <div className="flex gap-4 overflow-x-auto -mx-4 sm:mx-0 snap-x scroll-pl-4 sm:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {destinations.map(({ region, image, count }, i) => (
            <Link key={region.slug} href={search(region.name)} className={`group relative shrink-0 w-60 h-40 rounded-2xl overflow-hidden snap-start${i === 0 ? " ms-4 sm:ms-0" : ""}${i === destinations.length - 1 ? " me-4 sm:me-0" : ""}`}>
              {image ? (
                <Image src={image} alt={region.label} fill sizes="240px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : null}
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-white">
                <span className="block font-semibold leading-tight">{region.label}</span>
                <span className="block text-xs text-white/85">{count} stays</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <HotelRail title="Top-rated stays" subtitle="Guest favorites across our markets" hotels={topRated} />
      <HotelRail title="Beachfront stays" subtitle="Steps from the sand" hotels={beachfront} />

      <ViatorPackages />

      <PopularDestinations />

      {/* LiteAPI Booking Assistant — homepage only (it's hidden off-home anyway), public key, browser-safe.
          lazyOnload keeps the third-party widget off the critical path so it can't regress LCP / CWV. */}
      <Script
        src="https://components.liteapi.travel/chatbot/v1.js?liteApiKey=prod_public_f27848bb-47d8-46ec-915c-ff9e8070fdbc"
        strategy="lazyOnload"
      />
    </div>
  );
}
