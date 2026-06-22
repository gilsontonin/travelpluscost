"use client";

import { useState, type ReactNode } from "react";
import type { AmenityGroup } from "@/lib/amenityGroups";

const ICON: Record<string, ReactNode> = {
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="0.6" fill="currentColor" /></>,
  parking: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h3.5a2.5 2.5 0 0 1 0 5H9" /></>,
  pool: <><path d="M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" /><path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" /><path d="M7 17V6a2 2 0 0 1 4 0M13 17V6a2 2 0 0 1 4 0" /></>,
  food: <><path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20" /><path d="M16 2a4 4 0 0 0-4 4v6h4m0-10v20" /></>,
  family: <><circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M15 21v-1a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1" /></>,
  access: <><circle cx="12" cy="4" r="1.6" /><path d="M9 8h6M12 8v6h5l1.5 6M9 14a4 4 0 1 0 4 4" /></>,
  activity: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></>,
  service: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  climate: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
  bed: <><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M3 18v2M21 18v2" /><path d="M7 10V8a1 1 0 0 1 1-1h3v3" /></>,
  bath: <><path d="M4 12V6a2 2 0 0 1 4 0M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" /><path d="M6 19v2M18 19v2" /></>,
  tv: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  view: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 15 5-5 4 4 3-3 6 6" /><circle cx="9" cy="8" r="1.4" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
};

function Glyph({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-black/55">
      {ICON[name] ?? ICON.check}
    </svg>
  );
}

function GroupBlock({ g }: { g: AmenityGroup }) {
  return (
    <div className="break-inside-avoid">
      <div className="mb-2 flex items-center gap-2">
        <Glyph name={g.icon} />
        <h3 className="font-semibold">{g.title}</h3>
      </div>
      <ul className="space-y-1.5 pl-7 text-sm text-black/70">
        {g.items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

// Every group + item is rendered in the DOM (crawlable). Long lists collapse VISUALLY with a
// max-height + fade and expand inline on click — never a conditionally-rendered modal that hides
// the content from Google.
export default function AmenityGroups({
  title,
  groups,
  seeAllLabel,
}: {
  title: string;
  groups: AmenityGroup[];
  seeAllLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!groups.length) return null;
  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);
  const collapsible = groups.length > 2 || totalItems > 10;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="relative">
        <div className={collapsible && !expanded ? "max-h-[300px] overflow-hidden" : ""}>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {groups.map((g) => (
              <GroupBlock key={g.title} g={g} />
            ))}
          </div>
        </div>
        {collapsible && !expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f4f4f6] to-transparent" />
        ) : null}
      </div>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {expanded ? "Show less" : seeAllLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </section>
  );
}
