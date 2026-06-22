import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import ResultsList from "@/components/ResultsList";
import VibeResults from "@/components/VibeResults";
import { searchDirectory } from "@/lib/directory";
import { REGIONS } from "@/lib/regions";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const destination = sp.destination ?? "";
  const vibe = sp.vibe ?? "";
  const checkin = sp.checkin;
  const checkout = sp.checkout;
  const adults = sp.adults ? parseInt(sp.adults, 10) : 2;

  // Every US city, from the directory (live "from" prices fetched per result set). Vibe (AI) search
  // is handled client-side by <VibeResults> — it's a slow, paid call that wants a loading state.
  const hotels = !vibe && destination ? await searchDirectory(destination) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <SearchPanel
        key={`${destination}|${vibe}|${checkin}|${checkout}|${adults}`}
        compact
        initial={{ destination, vibe, checkin, checkout, adults: String(adults) }}
      />

      {vibe ? (
        <div className="mt-3">
          <VibeResults key={`${vibe}|${checkin}|${checkout}|${adults}`} query={vibe} checkin={checkin} checkout={checkout} adults={adults} />
        </div>
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
