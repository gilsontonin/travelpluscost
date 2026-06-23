import Link from "next/link";

// Links with an href are live; those without aren't built yet and render as muted text
// (so the footer never has dead "#" links).
type FLink = { label: string; href?: string };
const COLS: { title: string; links: FLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
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
  return (
    <footer className="bg-[#15151a] text-white/70 mt-16">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div id="about" className="scroll-mt-24 col-span-2 md:col-span-1">
          <div className="font-bold text-lg text-white">
            <span className="text-accent">travel</span>pluscost
          </div>
          <p className="mt-3 text-sm max-w-xs">
            One honest price. The same for everyone — what the hotel charges us, plus one small flat
            fee. We never use your data to set it.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-white font-medium text-sm mb-3">{c.title}</p>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <Link href={l.href} className="hover:text-white transition">
                      {l.label}
                    </Link>
                  ) : (
                    <span className="text-white/55 cursor-default" title="Coming soon">
                      {l.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-white/40">
          © {new Date().getFullYear()} travelpluscost · prototype
        </div>
      </div>
    </footer>
  );
}
