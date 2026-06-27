import type { Metadata } from "next";
import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import ResultsList from "@/components/ResultsList";
import VibeResults from "@/components/VibeResults";
import { searchDirectory } from "@/lib/directory";
import { REGIONS } from "@/lib/regions";

export const dynamic = "force-dynamic";

// `/search` is an interactive results tool that mirrors the indexable `/hotels/<city>` hubs, so every
// `?destination=` variant shared one generic title (a duplicate-title-tag flood in audits) and competed
// with the real city pages. NOINDEX it (follow, to pass equity to the hubs) and give it a unique,
// destination-aware title so it's clean either way.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const dest = (sp.destination ?? "").trim();
  return {
    title: { absolute: dest ? `Search hotels in ${dest} | travelpluscost` : "Search hotels | travelpluscost" },
    description: dest
      ? `Search live hotel prices in ${dest} — one honest all-in price, the same for everyone, never based on your data.`
      : "Search hotels by city — one honest all-in price: the rate plus one small flat fee, the same for everyone.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const destination = sp.destination ?? "";
  const vibe = sp.vibe ?? "";
  const vibeMode = sp.mode === "vibe"; // header "Search by vibe" → open the vibe input (no query yet)
  const checkin = sp.checkin;
  const checkout = sp.checkout;
  const adults = sp.adults ? parseInt(sp.adults, 10) : 2;

  // Every US city, from the directory (live "from" prices fetched per result set). Vibe (AI) search
  // is handled client-side by <VibeResults> — it's a slow, paid call that wants a loading state.
  const hotels = !vibe && destination ? await searchDirectory(destination) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <SearchPanel
        key={`${destination}|${vibe}|${vibeMode ? "v" : ""}|${checkin}|${checkout}|${adults}`}
        compact
        startVibe={vibeMode}
        initial={{ destination, vibe, checkin, checkout, adults: String(adults) }}
      />

      <h1 className={destination && !vibe ? "mt-4 text-lg font-semibold tracking-tight" : "sr-only"}>
        {destination && !vibe ? `Hotels in ${destination}` : "Search hotels"}
      </h1>

      {vibe ? (
        <div className="mt-3">
          <VibeResults key={`${vibe}|${checkin}|${checkout}|${adults}`} query={vibe} checkin={checkin} checkout={checkout} adults={adults} />
        </div>
      ) : vibeMode ? (
        <p className="text-black/50 py-16 text-center">Describe your perfect trip in the box above to search by vibe.</p>
      ) : !destination ? (
        <p className="text-black/50 py-16 text-center">
          Enter a destination above to see hotels.{" "}
          <Link className="text-accent" href="/">
            Back home
          </Link>
        </p>
      ) : hotels.length === 0 ? (
        <div className="text-black/50 py-16 text-center">
          <p>
            No stays found for <span className="font-medium">{destination}</span>. Check the spelling, or try a
            popular destination:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {REGIONS.map((r) => (
              <Link
                key={r.slug}
                href={`/search?destination=${encodeURIComponent(r.name)}&adults=2`}
                className="px-3 py-1.5 rounded-lg border border-black/15 text-sm text-black/70 hover:border-accent hover:text-accent transition"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-xs text-accent font-medium mb-2.5">
            One price for everyone — never based on your data.
          </p>
          <ResultsList hotels={hotels} checkin={checkin} checkout={checkout} adults={adults} />
        </div>
      )}
    </div>
  );
}
