import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import { getVertical } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals";

export default function ComingSoon({ id }: { id: Vertical }) {
  const v = getVertical(id);
  return (
    <section className="mx-auto max-w-3xl px-4 pt-12 pb-20 text-center">
      <span className="inline-block text-xs font-medium text-accent bg-accent-tint px-3 py-1 rounded-md">
        {v.label} · coming soon
      </span>
      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">{v.label}, at cost — soon.</h1>
      <p className="mt-3 text-black/55 max-w-xl mx-auto">{v.blurb}</p>
      <p className="mt-2 text-sm text-black/45">
        Built on the same engine as hotels — one honest price, the same for everyone, never based on your data.
      </p>
      <div className="mt-8">
        <SearchPanel active={id} />
      </div>
      <Link
        href="/search?destination=Oahu&adults=2"
        className="mt-6 inline-block bg-accent text-white font-medium px-6 py-3 rounded-full hover:opacity-90 transition"
      >
        Search hotels (live now)
      </Link>
    </section>
  );
}
