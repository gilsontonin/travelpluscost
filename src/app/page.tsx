import Link from "next/link";
import SearchBar from "@/components/SearchBar";

const POPULAR = ["Las Vegas", "New York", "Honolulu", "Miami", "Los Angeles", "Orlando"];

export default function Home() {
  return (
    <section className="mx-auto max-w-4xl px-5 pt-20 pb-10 text-center">
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
        One honest price.
        <br />
        The same for everyone.
      </h1>
      <p className="mt-4 text-lg text-black/60 max-w-xl mx-auto">
        What the hotel charges us, plus one small flat fee. Search from any phone, any city, any day —
        same number. We never use your data to set it.
      </p>
      <div className="mt-8">
        <SearchBar />
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {POPULAR.map((c) => (
          <Link
            key={c}
            href={`/search?destination=${encodeURIComponent(c)}&adults=2`}
            className="px-4 py-2 rounded-full border border-black/10 text-sm hover:border-accent hover:text-accent transition"
          >
            {c}
          </Link>
        ))}
      </div>
    </section>
  );
}
