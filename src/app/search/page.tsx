import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import ResultsList from "@/components/ResultsList";
import { searchOahu, toCard } from "@/lib/oahu";

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
    <div className="mx-auto max-w-5xl px-4 py-4">
      <SearchPanel compact initial={{ destination, checkin, checkout, adults: String(adults) }} />

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
        <div className="mt-3">
          <p className="text-xs text-accent font-medium mb-2.5">
            One price for everyone — never based on your data.
          </p>
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
        </div>
      )}
    </div>
  );
}
