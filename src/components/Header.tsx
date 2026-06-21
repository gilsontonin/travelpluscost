"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/search?destination=Oahu&adults=2", label: "Hotels" },
  { href: "/#how", label: "How pricing works" },
  { href: "/#about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-0.5 font-bold text-lg">
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

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#"
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Sign in
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 -mr-2 text-black/70"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
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
            <Link href="#" className="mt-1 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg text-center">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
