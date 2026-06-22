"use client";

import { useEffect, useState } from "react";

// Sticky jump-nav under the gallery (Expedia: Overview / Rooms / Location / Policies). Anchors to the
// matching section ids; scroll-spy underlines whichever section is in view.
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms" },
  { id: "location", label: "Location" },
  { id: "policies", label: "Policies" },
] as const;

export default function PropertyNav() {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="sticky top-[84px] z-20 -mx-4 mt-4 border-b border-black/[0.08] bg-[#f4f4f6]/95 px-4 backdrop-blur sm:mx-0 sm:px-0">
      <ul className="flex gap-6 text-sm">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`inline-block border-b-2 py-3 transition ${
                active === s.id
                  ? "border-accent font-medium text-black"
                  : "border-transparent text-black/60 hover:text-black"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
