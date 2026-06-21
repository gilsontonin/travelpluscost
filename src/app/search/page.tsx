import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import HotelCard from "@/components/HotelCard";
import { searchHotels } from "@/lib/hotels";

// Live rates per request — never prerender at build.
export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-6xl px-5 py-8">
      <SearchBar initial={{ destination, checkin, checkout, adults: String(adults) }} />

      <div className="mt-6 mb-4 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">
          {destination ? `Hotels in ${destination}` : "Search for a destination"}
        </h1>
        {hotels.length ? <span className="text-sm text-black/50">{hotels.length} stays</span> : null}
      </div>

      {destination && hotels.length === 0 ? (
        <p className="text-black/50 py-16 text-center">
          No hotels found for “{destination}”. Try another US city.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}

      {!destination && (
        <p className="text-black/50 py-16 text-center">
          Enter a city above to see hotels.{" "}
          <Link className="text-accent" href="/">
            Back home
          </Link>
        </p>
      )}
    </div>
  );
}
