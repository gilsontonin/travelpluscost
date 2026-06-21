import Link from "next/link";

const COLS = [
  { title: "Company", links: ["About", "How pricing works", "Press", "Careers"] },
  { title: "Explore", links: ["Hotels", "Flights — soon", "Cars — soon", "Attractions — soon"] },
  { title: "Support", links: ["Help Center", "Contact", "Trust & Safety", "Privacy"] },
];

export default function Footer() {
  return (
    <footer className="bg-[#15151a] text-white/70 mt-16">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
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
                <li key={l}>
                  <Link href="#" className="hover:text-white transition">
                    {l}
                  </Link>
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
