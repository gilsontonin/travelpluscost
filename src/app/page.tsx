import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";

const POPULAR = ["Oahu", "Honolulu", "Waikiki", "Kapolei", "Kailua"];

export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 pb-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          One honest price.
          <br />
          The same for everyone.
        </h1>
        <p className="mt-4 text-lg text-black/55">
          What the hotel charges us, plus one small flat fee. Search from any phone, any city, any day —
          same number. We never use your data to set it.
        </p>
      </div>
      <div className="mt-8">
        <SearchPanel />
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {POPULAR.map((c) => (
          <Link
            key={c}
            href={`/search?destination=${encodeURIComponent(c)}&adults=2`}
            className="px-4 py-2 rounded-lg bg-white border border-black/5 text-sm hover:border-accent hover:text-accent transition"
          >
            {c}
          </Link>
        ))}
      </div>
    </section>
  );
}
