import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import ResultsList from "@/components/ResultsList";
import { searchOahu, toCard } from "@/lib/oahu";

const TABS = ["Any", "Hotels", "Homes"];
const FILTERS = ["Filters", "Popular", "Price", "Guest rating", "Property amenities", "Sort"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const destination = sp.destination ?? "";
  const checkin = sp.checkin;
  const checkout = sp.checkout;
  const adults = sp.adults ? parseInt(sp.adults, 10) : 2;

  const hotels = destination ? searchOahu(destination).map(toCard) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <SearchPanel initial={{ destination, checkin, checkout, adults: String(adults) }} />

      <div className="mt-5 inline-flex bg-black/[0.05] rounded-lg p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`text-sm px-5 py-2 rounded-md transition ${
              i === 1 ? "bg-white shadow-sm font-semibold" : "text-black/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            className="text-sm border border-black/15 rounded-lg px-3 py-2 bg-white hover:border-black/30 flex items-center gap-1"
          >
            {f}
            {f !== "Filters" ? <span className="text-black/40 text-xs">▾</span> : null}
          </button>
        ))}
        <span className="text-xs text-black/40 ml-1">How our sort order works ⓘ</span>
      </div>

      <div className="mt-4 rounded-lg bg-accent-tint/70 px-4 py-3 text-sm">
        <span className="font-medium text-accent">One honest price.</span> The same for everyone, every
        search — never based on your data.
      </div>

      <p className="mt-4 text-sm text-black/60">
        {destination ? (
          <>
            <span className="font-semibold text-black">{hotels.length}</span> stays near{" "}
            <span className="font-semibold text-black">{destination}</span>
          </>
        ) : (
          "Search for a destination"
        )}
      </p>

      <div className="mt-3">
        {!destination ? (
          <p className="text-black/50 py-16 text-center">
            Enter a destination above to see hotels.{" "}
            <Link className="text-accent" href="/">
              Back home
            </Link>
          </p>
        ) : hotels.length === 0 ? (
          <p className="text-black/50 py-16 text-center">
            We&apos;re live in <span className="font-medium">Oahu, Hawaii</span> first — try{" "}
            <Link className="text-accent" href="/search?destination=Oahu&adults=2">
              Oahu
            </Link>
            . More destinations are coming.
          </p>
        ) : (
          <>
            <ResultsList hotels={hotels} checkin={checkin} checkout={checkout} adults={adults} />
            <div className="mt-8 flex items-center justify-center gap-1 text-sm">
              {["1", "2", "3", "…", "8", "9", "10"].map((p, i) => (
                <button
                  key={i}
                  className={`w-9 h-9 rounded-md ${p === "1" ? "bg-accent text-white" : "hover:bg-black/5 text-black/70"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
