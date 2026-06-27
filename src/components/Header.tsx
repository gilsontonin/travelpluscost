"use client";

import Link from "next/link";
import { useState } from "react";
import VibeSearchCta from "@/components/VibeSearchCta";
import AuthNav from "@/components/AuthNav";
import Logo from "@/components/Logo";

// The menu's most valuable, sensible links — the logo is the Home link (no "Home" item).
// - Hotels → /hotels: the real browse index (every U.S. state + top cities), NOT the empty /search tool.
// - Guides → /blog: the travel guides.
// - How it works → /about: the "Why you pay what you pay" pricing + brand story. (This absorbs the old
//   "Pricing → /#how" item, which just bounced you to the homepage, and the duplicate "About" — both
//   were really this one page.)
const NAV = [
  { href: "/hotels", label: "Hotels" },
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "How it works" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        {/* one clean frosted-glass row, fixed height — no tagline strip */}
        <div className="bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 rounded-2xl shadow-card border border-black/[0.06] px-4 sm:px-5">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link href="/" aria-label="travelplus — home" className="shrink-0">
              <Logo className="text-[1.15rem]" />
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-[0.9rem] font-medium text-black/65">
              {NAV.map((n) => (
                <Link key={n.label} href={n.href} className="hover:text-foreground transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <AuthNav />
              {/* The wide "Search by vibe" pill is desktop-only in the top bar — on mobile it lives in
                  the dropdown menu below, so it doesn't crowd the hamburger off the right edge. */}
              <span className="hidden md:inline-flex">
                <VibeSearchCta />
              </span>
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden -mr-1 p-2 text-black/80"
                aria-label="Menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-card border border-black/[0.06] mt-2 p-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-xl text-[0.95rem] font-medium hover:bg-black/[0.04]"
              >
                {n.label}
              </Link>
            ))}
            <VibeSearchCta className="mt-2 self-center" />
          </div>
        )}
      </div>
    </header>
  );
}
