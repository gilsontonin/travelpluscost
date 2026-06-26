import type { Metadata } from "next";
import SearchPanel from "@/components/SearchPanel";
import VibePromptPill from "@/components/VibePromptPill";
import HotelRail from "@/components/HotelRail";
import NearbyRail from "@/components/NearbyRail";
import SeasonalRail from "@/components/SeasonalRail";
import RecentlyViewed from "@/components/RecentlyViewed";
import PopularDestinations from "@/components/PopularDestinations";
import MemberWelcome from "@/components/MemberWelcome";
import SavedRail from "@/components/SavedRail";
import { getAllHotels, toCard, toRail } from "@/lib/hotels";

// Member home — inventory-forward (mirrors the homepage layout), with a compact member welcome on top.
// Lowest-resistance path: land → search/browse immediately. Member-only, so kept out of the index.
export const metadata: Metadata = { robots: { index: false } };

export default function AccountPage() {
  const all = getAllHotels();
  const cards = all.map(toCard);
  // Review-weighted (Bayesian) sort — same as the homepage so a 1-review 10 can't top a well-reviewed stay.
  const weighted = (c: (typeof cards)[number]) => {
    const v = c.reviewCount ?? 0;
    const R = c.rating ?? 0;
    return (v * R + 25 * 8) / (v + 25);
  };
  const topRated = [...cards].filter((c) => c.rating != null).sort((a, b) => weighted(b) - weighted(a)).slice(0, 12);
  const beachfront = cards.filter((c) => c.amenities.includes("Beachfront")).slice(0, 12);
  const railAll = all.map(toRail);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16">
      <MemberWelcome />

      <div className="mt-5">
        <SearchPanel />
        <VibePromptPill />
      </div>

      <SavedRail />
      <RecentlyViewed all={railAll} />
      <NearbyRail />
      <SeasonalRail />
      <HotelRail title="Top-rated stays" subtitle="Guest favorites across our markets" hotels={topRated} />
      <HotelRail title="Beachfront stays" subtitle="Steps from the sand" hotels={beachfront} />
      <PopularDestinations />
    </div>
  );
}
