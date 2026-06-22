import Link from "next/link";

// Quick-pick city links (Expedia-style "explore" clusters) → straight to that city's search.
// Server-rendered plain links: fast, crawlable internal links + one-tap city jumps. Every city
// below was verified to have real inventory in our directory.
const search = (q: string) => `/search?destination=${encodeURIComponent(q)}&adults=2`;

const GROUPS: { title: string; cities: string[] }[] = [
  {
    title: "Popular cities",
    cities: [
      "New York", "Los Angeles", "Las Vegas", "Orlando", "Miami", "Chicago", "San Francisco",
      "New Orleans", "Nashville", "Atlanta", "San Diego", "Austin", "Houston", "Washington, DC",
      "Boston", "Seattle", "Dallas", "Philadelphia", "Denver", "Phoenix", "San Antonio",
    ],
  },
  {
    title: "Beach & getaways",
    cities: [
      "Miami Beach", "Myrtle Beach", "Honolulu", "Key West", "Charleston", "Savannah", "Asheville",
      "Sedona", "Scottsdale", "Pigeon Forge", "Gatlinburg", "Branson", "Virginia Beach",
    ],
  },
];

export default function PopularDestinations() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">Explore top destinations</h2>
      <p className="mt-0.5 mb-4 text-sm text-black/55">Jump straight to hotels in a city — one honest price, anywhere.</p>
      <div className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">{g.title}</p>
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scroll-pl-4 sm:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {g.cities.map((c, i) => (
                <Link
                  key={c}
                  href={search(c)}
                  className={`shrink-0 snap-start whitespace-nowrap rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/75 transition hover:border-accent hover:text-accent${i === 0 ? " ms-4 sm:ms-0" : ""}${i === g.cities.length - 1 ? " me-4 sm:me-0" : ""}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
