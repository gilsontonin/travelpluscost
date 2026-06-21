import SearchPanel from "@/components/SearchPanel";
import HotelRail from "@/components/HotelRail";
import RecentlyViewed from "@/components/RecentlyViewed";
import { getAllOahu, toCard, toRail } from "@/lib/oahu";
import { haversineMiles, OAHU_LANDMARKS } from "@/lib/distance";

const search = (q: string) => `/search?destination=${encodeURIComponent(q)}&adults=2`;

export default function Home() {
  const cards = getAllOahu().map(toCard);
  const topRated = [...cards]
    .filter((c) => c.rating != null)
    .sort((a, b) => (b.rating as number) - (a.rating as number))
    .slice(0, 12);
  const beachfront = cards.filter((c) => c.amenities.includes("Beachfront")).slice(0, 12);
  const rentals = cards.filter((c) => c.category === "rental").slice(0, 12);
  const wk = OAHU_LANDMARKS.find((l) => l.name === "Waikiki Beach")!;
  const nearWaikiki = [...cards]
    .filter((c) => c.lat != null && c.lng != null)
    .sort(
      (a, b) =>
        haversineMiles(a.lat as number, a.lng as number, wk.lat, wk.lng) -
        haversineMiles(b.lat as number, b.lng as number, wk.lat, wk.lng),
    )
    .slice(0, 12);
  const railAll = getAllOahu().map(toRail);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-16">
      {/* hero */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          One honest price.
          <br />
          The same for everyone.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-black/55">
          What the hotel charges us, plus one small flat fee. Search from any phone, any city, any day — same
          number. Never based on your data.
        </p>
      </div>

      <div className="mt-8">
        <SearchPanel />
      </div>

      {/* honest trust strip (our take on Expedia's value banner) */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-black/60">
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
      <HotelRail title="Top-rated on Oahu" subtitle="Guest-favorite stays" hotels={topRated} seeAllHref={search("Oahu")} />
      <HotelRail title="Beachfront stays" subtitle="Steps from the sand" hotels={beachfront} seeAllHref={search("Oahu")} />
      <HotelRail title="Near Waikiki Beach" hotels={nearWaikiki} seeAllHref={search("Waikiki")} />
      <HotelRail title="Vacation rentals" subtitle="Condos, apartments & homes" hotels={rentals} seeAllHref={search("Oahu")} />
    </div>
  );
}
