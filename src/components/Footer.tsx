import Link from "next/link";
import { popularCities, statesSorted } from "@/lib/geo";
import Logo from "@/components/Logo";

// Links with an href are live; those without aren't built yet and render as muted text
// (so the footer never has dead "#" links).
type FLink = { label: string; href?: string };
const COLS: { title: string; links: FLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How pricing works", href: "/#how" },
      { label: "Press" },
      { label: "Careers" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Hotels", href: "/search" },
      { label: "Browse by state", href: "/hotels" },
      { label: "Travel guides", href: "/blog" },
      { label: "Flights — soon", href: "/flights" },
      { label: "Cars — soon", href: "/cars" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "mailto:hello@travelpluscost.com" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Affiliate disclosure", href: "/disclosure" },
    ],
  },
];

export default function Footer() {
  const cities = popularCities(30);
  const states = statesSorted().slice(0, 16);
  return (
    <footer className="bg-grouped text-muted mt-20">
      {/* Site-wide destination links — every page distributes equity to the top city + state hubs
          (the OTA footer pattern). Static, from content/geo-index.json (no DB call). */}
      <div className="border-b border-black/[0.08]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-foreground font-semibold text-sm mb-4">Popular destinations</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {cities.map((c) => (
              <Link key={c.slug} href={`/hotels/${c.slug}`} className="hover:text-foreground transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
          <p className="text-foreground font-semibold text-sm mb-4 mt-8">Hotels by state</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {states.map((s) => (
              <Link key={s.code} href={`/destinations/${s.slug}`} className="hover:text-foreground transition-colors">
                {s.name}
              </Link>
            ))}
            <Link href="/hotels" className="text-accent hover:text-accent-hover transition-colors">
              Browse all U.S. destinations →
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div id="about" className="scroll-mt-24 col-span-2 md:col-span-1">
          <div className="text-lg text-foreground">
            <Logo />
          </div>
          <p className="mt-3 text-sm max-w-xs">
            One honest price. The same for everyone — what the hotel charges us, plus one small flat
            fee. We never use your data to set it.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-foreground font-semibold text-sm mb-3">{c.title}</p>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <Link href={l.href} className="hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  ) : (
                    <span className="text-black/35 cursor-default" title="Coming soon">
                      {l.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-black/[0.08]">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-black/40">
          © {new Date().getFullYear()} travelpluscost · prototype
        </div>
      </div>
    </footer>
  );
}
