import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./apple.css";

// Inter is the spec's recommended SF Pro substitute for non-Apple platforms; on macOS/iOS the CSS
// stack resolves to the real SF Pro first (see apple.css).
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Apple design trial · travelpluscost",
  // Design experiment — never index it; it must not compete with the real pages.
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
};

const NAV = [
  { href: "/preview/apple", label: "Overview" },
  { href: "/preview/apple/hub", label: "Stays" },
  { href: "/preview/apple/property", label: "A property" },
];

export default function AppleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`apple-root ${inter.variable} min-h-screen flex flex-col`}>
      {/* Global nav — ultra-thin true-black bar (component.global-nav). */}
      <header className="sticky top-0 z-40 ap-frost-dark text-white">
        <div className="mx-auto flex h-11 max-w-[1024px] items-center justify-between px-5">
          <Link href="/preview/apple" className="text-[15px] font-semibold tracking-tight">
            <span style={{ color: "var(--ap-blue-dark)" }}>travel</span>pluscost
          </Link>
          <nav className="flex items-center gap-6 text-[12px] text-white/80">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="transition hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="text-[12px] text-white/55 transition hover:text-white">
            Exit trial →
          </Link>
        </div>
      </header>

      {/* Sub-nav — frosted parchment strip with the trial label + the one persistent CTA. */}
      <div className="sticky top-11 z-30 ap-frost border-b border-black/[0.06]">
        <div className="mx-auto flex h-[52px] max-w-[1024px] items-center justify-between px-5">
          <span className="text-[21px] font-semibold tracking-tight" style={{ letterSpacing: "-0.01em" }}>
            Apple design trial
          </span>
          <div className="flex items-center gap-5">
            <span className="hidden text-[12px] text-black/45 sm:inline">Preview — not live</span>
            <Link href="/search?adults=2" className="ap-pill ap-pill-primary !px-4 !py-1.5 !text-[14px]">
              Search hotels
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1">{children}</main>

      {/* Footer — parchment, dense link columns (component.footer). */}
      <footer className="bg-[#f5f5f7] px-6 py-16 text-[#333]">
        <div className="mx-auto max-w-[1024px]">
          <p className="max-w-xl text-[12px] leading-relaxed text-[#7a7a7a]">
            This is a design experiment applying an Apple-style visual language to travelpluscost. The promise is
            unchanged: what the hotel charges us, plus one small flat fee — the same price for everyone, never based
            on your data.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[12px]">
            {["Overview", "Stays", "A property"].map((l, i) => (
              <Link key={l} href={NAV[i].href} className="ap-textlink">
                {l}
              </Link>
            ))}
            <Link href="/" className="text-[#7a7a7a] hover:text-[#333]">
              Back to the live site
            </Link>
          </div>
          <p className="mt-8 text-[10px] text-[#7a7a7a]">
            © {new Date().getFullYear()} travelpluscost · Apple design trial · not indexed
          </p>
        </div>
      </footer>
    </div>
  );
}
