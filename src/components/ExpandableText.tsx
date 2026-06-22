"use client";

import { useState, type ReactNode } from "react";

// Render a LiteAPI text blob as clean paragraphs + bullet lists. Lines starting with -, •, *, – or ·
// become list items; everything else is a paragraph. Collapsed by default with a soft fade.
function renderBlocks(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const blocks = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  blocks.forEach((block, bi) => {
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    let bullets: string[] = [];
    const flushPara = () => {
      if (para.length) {
        out.push(<p key={`p${bi}-${out.length}`}>{para.join(" ")}</p>);
        para = [];
      }
    };
    const flushBullets = () => {
      if (bullets.length) {
        out.push(
          <ul key={`u${bi}-${out.length}`} className="list-disc space-y-1 pl-5">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>,
        );
        bullets = [];
      }
    };
    for (const line of lines) {
      const m = line.match(/^[-•*–·]\s+(.*)/);
      if (m) {
        flushPara();
        bullets.push(m[1].trim());
      } else {
        flushBullets();
        para.push(line);
      }
    }
    flushPara();
    flushBullets();
  });
  return out;
}

export default function ExpandableText({ text, threshold = 280 }: { text: string; threshold?: number }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > threshold;

  return (
    <div>
      <div className="relative">
        <div className={`space-y-3 text-[15px] leading-relaxed text-black/75 ${!open && long ? "max-h-32 overflow-hidden" : ""}`}>
          {renderBlocks(text)}
        </div>
        {!open && long ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f4f4f6] to-transparent" />
        ) : null}
      </div>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {open ? "Read less" : "Read more"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
