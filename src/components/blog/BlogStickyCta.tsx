// Sticky "see prices" CTA — mobile only (sm:hidden), the OTA conversion staple: a fixed bottom bar
// that keeps the path to inventory one tap away on a long read. Honest (just a search link), blog only.
// Server component — it's a static link, no client JS. The page renders a matching spacer so the bar
// never covers the last line of content.
export default function BlogStickyCta({ city, href }: { city: string; href: string }) {
  return (
    <>
      <div className="h-16 sm:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 pl-4 pr-[5.5rem] py-2.5 backdrop-blur sm:hidden">
        <a
          href={href}
          className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-semibold text-white shadow-sm active:opacity-90"
        >
          See {city} prices
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </>
  );
}
