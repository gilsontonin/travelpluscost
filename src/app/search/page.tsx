import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import HotelRow from "@/components/HotelRow";
import { searchHotels } from "@/lib/hotels";

// Live rates per request — never prerender at build.
export const dynamic = "force-dynamic";

const TABS = ["All stays", "Hotels", "Homes"];
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

  const hotels = destination ? await searchHotels(destination, { checkin, checkout, adults }) : [];

  const cardQuery = new URLSearchParams({
    ...(checkin ? { checkin } : {}),
    ...(checkout ? { checkout } : {}),
    adults: String(adults),
  }).toString();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <SearchPanel initial={{ destination, checkin, checkout, adults: String(adults) }} />

      {/* tabs */}
      <div className="mt-5 flex gap-1 border-b border-black/10">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`text-sm px-4 py-2.5 -mb-px border-b-2 ${
              i === 1 ? "border-accent text-accent font-medium" : "border-transparent text-black/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* filter bar */}
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

      {/* honesty banner (our version of Expedia's "sale" strip) */}
      <div className="mt-4 rounded-xl bg-accent-tint/70 px-4 py-3 text-sm">
        <span className="font-medium text-accent">One honest price.</span> The same for everyone, every
        search — never based on your data.
      </div>

      {/* count */}
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

      {/* list */}
      <div className="mt-3">
        {!destination ? (
          <p className="text-black/50 py-16 text-center">
            Enter a city above to see hotels.{" "}
            <Link className="text-accent" href="/">
              Back home
            </Link>
          </p>
        ) : hotels.length === 0 ? (
          <p className="text-black/50 py-16 text-center">
            No hotels found for “{destination}”. Try another US city.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {hotels.map((h) => (
                <HotelRow key={h.id} hotel={h} query={cardQuery} />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-1 text-sm">
              {["1", "2", "3", "…", "8", "9", "10"].map((p, i) => (
                <button
                  key={i}
                  className={`w-9 h-9 rounded-full ${p === "1" ? "bg-accent text-white" : "hover:bg-black/5 text-black/70"}`}
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
