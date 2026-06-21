import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import PropertyCard from "@/components/PropertyCard";
import { searchHotels } from "@/lib/hotels";

// Live rates per request — never prerender at build.
export const dynamic = "force-dynamic";

const CATEGORIES = [
  "All",
  "Hotels",
  "Resorts",
  "Beachfront",
  "City center",
  "Luxury",
  "Budget",
  "Pet-friendly",
  "Pools",
];

const PLACE_TYPES: { t: string; d: string; on: boolean }[] = [
  { t: "Entire place", d: "A place all to yourself", on: true },
  { t: "Shared room", d: "Common areas shared with others", on: false },
  { t: "Room", d: "Your own room, plus shared spaces", on: true },
];

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <SearchPanel initial={{ destination, checkin, checkout, adults: String(adults) }} />

      {/* results bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl">
          {destination ? (
            <>
              Found <span className="font-semibold">{hotels.length}</span> stays near{" "}
              <span className="font-semibold">{destination}</span>
            </>
          ) : (
            "Search for a destination"
          )}
        </h1>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center gap-2 text-sm border border-black/10 rounded-full px-3 py-2 bg-white">
            Latest ▾
          </button>
          <div className="flex border border-black/10 rounded-full bg-white overflow-hidden text-sm">
            <button className="px-3 py-2 text-black/60">Map View</button>
            <button className="px-3 py-2 bg-accent-tint text-accent font-medium">Card View</button>
          </div>
          <button className="lg:hidden text-sm border border-black/10 rounded-full px-3 py-2 bg-white">
            Filters (3)
          </button>
        </div>
      </div>

      {/* category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {CATEGORIES.map((c, i) => (
          <button
            key={c}
            className={`whitespace-nowrap text-sm px-4 py-2 rounded-full border transition ${
              i === 0
                ? "bg-black text-white border-black"
                : "bg-white border-black/10 text-black/70 hover:border-black/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* results + filters */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {hotels.map((h) => (
                  <PropertyCard key={h.id} hotel={h} />
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

        {/* filters sidebar (visual) */}
        <aside className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-black/5 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <button className="text-xs text-accent">Clear all filter (3)</button>
            </div>

            <div className="mb-5">
              <p className="font-medium text-sm">Price range</p>
              <p className="text-xs text-black/45 mb-3">The average total price for this stay.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-black/10 rounded-xl px-3 py-2 text-sm text-black/60">$ 120</div>
                <div className="border border-black/10 rounded-xl px-3 py-2 text-sm text-black/60">$ 700</div>
              </div>
            </div>

            <div className="mb-5">
              <p className="font-medium text-sm mb-2">Type of place</p>
              {PLACE_TYPES.map((pt) => (
                <label key={pt.t} className="flex gap-3 py-2">
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md border grid place-items-center text-[11px] ${
                      pt.on ? "bg-accent border-accent text-white" : "border-black/20"
                    }`}
                  >
                    {pt.on ? "✓" : ""}
                  </span>
                  <span>
                    <span className="text-sm">{pt.t}</span>
                    <br />
                    <span className="text-xs text-black/45">{pt.d}</span>
                  </span>
                </label>
              ))}
            </div>

            <div>
              <p className="font-medium text-sm mb-3">Rooms and beds</p>
              {["Bedrooms", "Beds", "Bathrooms"].map((r) => (
                <div key={r} className="mb-3">
                  <p className="text-xs text-black/50 mb-2">{r}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {["Any", "1", "2", "3", "4", "5"].map((n, i) => (
                      <span
                        key={n}
                        className={`text-xs px-3 py-1.5 rounded-full border ${
                          i === 0
                            ? "bg-accent-tint text-accent border-accent/30"
                            : "border-black/10 text-black/60"
                        }`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
