"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/search?destination=Oahu&adults=2", label: "Hotels" },
  { href: "/#how", label: "How pricing works" },
  { href: "/#about", label: "About" },
];

const SEARCH_HREF = "/search?destination=Oahu&adults=2";

function SearchCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href={SEARCH_HREF}
      className={`bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition inline-flex items-center gap-1.5 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      Search<span className="hidden sm:inline">&nbsp;hotels</span>
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-baseline gap-0.5 font-bold text-lg shrink-0">
              <span className="text-accent">travel</span>
              <span>pluscost</span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-sm text-black/70">
              {NAV.map((n) => (
                <Link key={n.label} href={n.href} className="hover:text-black transition">
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <SearchCta />
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 -mr-1 text-black/70"
                aria-label="Menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </div>
          </div>

          {/* always-visible philosophy quick-read — snappy lead + the promise */}
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] sm:text-xs text-black/55">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-accent shrink-0 mt-0.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              <b className="text-black/80">Hotels at cost + one flat fee.</b> The same price for everyone — never based
              on your data.
            </span>
          </p>
        </div>

        {open && (
          <div className="md:hidden bg-white rounded-2xl shadow-sm border border-black/5 mt-2 p-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-black/5 text-sm"
              >
                {n.label}
              </Link>
            ))}
            <SearchCta className="mt-1 justify-center" />
          </div>
        )}
      </div>
    </header>
  );
}
