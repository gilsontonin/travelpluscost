import Link from "next/link";

// `::cta <destination>` — a compact, honest inline call-to-action. Routes to our one-price search.
// e.g. `::cta Wailea` after a section, when a full search box would be too heavy.
export default function CtaWidget({ dest }: { dest: string }) {
  return (
    <div className="my-6 flex flex-col gap-3 rounded-2xl border border-accent/20 bg-accent-tint/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-black">
        See live {dest} prices — one honest number, the same for everyone.
      </p>
      <Link
        href={`/search?destination=${encodeURIComponent(dest)}&adults=2`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Search {dest}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
