// Blog body helpers — heading extraction (ToC + anchor ids) and the directive block-parser that lets
// a post embed `::infographic <key>` and `::hotel <id>` between Markdown. Kept dependency-free: we
// slugify headings ourselves (no rehype-slug) and split the body into ordered blocks the page renders.

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

/** H2/H3 headings from the Markdown body — drives the table of contents + anchor ids. */
export function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  for (const line of body.split("\n")) {
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/\*\*/g, "").trim();
    out.push({ level: m[1].length === 2 ? 2 : 3, text, id: slugify(text) });
  }
  return out;
}

export type Block =
  | { type: "md"; text: string }
  | { type: "infographic"; key: string }
  | { type: "hotel"; id: string }
  | { type: "priceproof" }
  | { type: "cta"; dest: string }
  | { type: "search"; dest: string }
  | { type: "rail"; dest: string }
  | { type: "map"; dest: string }
  | { type: "compare"; ids: string[] }
  | { type: "areas"; dest: string }
  | { type: "details"; summary: string; text: string }
  | { type: "showcase"; id: string; text: string }
  | { type: "activities"; dest: string }
  | { type: "activity"; dest: string; q: string };

/** Split the body into ordered blocks: Markdown prose, `::infographic <key>`, `::hotel <id>`. */
export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let buf: string[] = [];
  // `::details <summary>` … `::/details` wraps the lines between into a collapsible block.
  let det: { summary: string; buf: string[] } | null = null;
  // `::showcase <id>` … `::end` wraps the lines between as the faded prose under a big property card.
  let show: { id: string; buf: string[] } | null = null;
  const flush = () => {
    const t = buf.join("\n").trim();
    if (t) blocks.push({ type: "md", text: t });
    buf = [];
  };
  const closeDetails = () => {
    if (det) blocks.push({ type: "details", summary: det.summary, text: det.buf.join("\n").trim() });
    det = null;
  };
  const closeShowcase = () => {
    if (show) blocks.push({ type: "showcase", id: show.id, text: show.buf.join("\n").trim() });
    show = null;
  };
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (det) {
      if (/^::\/details\s*$/.test(t) || /^::end\s*$/.test(t)) closeDetails();
      else det.buf.push(line);
      continue;
    }
    if (show) {
      if (/^::\/showcase\s*$/.test(t) || /^::end\s*$/.test(t)) closeShowcase();
      else show.buf.push(line);
      continue;
    }
    const dm = /^::details\s+(.+?)\s*$/.exec(t);
    if (dm) { flush(); det = { summary: dm[1], buf: [] }; continue; }
    const sm = /^::showcase\s+(\S+)\s*$/.exec(t);
    if (sm) { flush(); show = { id: sm[1], buf: [] }; continue; }
    const ig = /^::infographic\s+(\S+)\s*$/.exec(t);
    const ht = /^::hotel\s+(\S+)\s*$/.exec(t);
    if (ig) { flush(); blocks.push({ type: "infographic", key: ig[1] }); }
    else if (ht) { flush(); blocks.push({ type: "hotel", id: ht[1] }); }
    else if (/^::priceproof\s*$/.test(t)) { flush(); blocks.push({ type: "priceproof" }); }
    else if (/^::cta\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "cta", dest: /^::cta\s+(.+?)\s*$/.exec(t)![1] }); }
    else if (/^::search\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "search", dest: /^::search\s+(.+?)\s*$/.exec(t)![1] }); }
    else if (/^::rail\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "rail", dest: /^::rail\s+(.+?)\s*$/.exec(t)![1].trim() }); }
    else if (/^::map\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "map", dest: /^::map\s+(.+?)\s*$/.exec(t)![1].trim() }); }
    else if (/^::compare\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "compare", ids: /^::compare\s+(.+?)\s*$/.exec(t)![1].trim().split(/\s+/) }); }
    else if (/^::areas\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "areas", dest: /^::areas\s+(.+?)\s*$/.exec(t)![1].trim() }); }
    else if (/^::activities\s+(.+?)\s*$/.test(t)) { flush(); blocks.push({ type: "activities", dest: /^::activities\s+(.+?)\s*$/.exec(t)![1].trim() }); }
    else if (/^::activity\s+(.+?)\s*\|\s*(.+?)\s*$/.test(t)) { flush(); const m = /^::activity\s+(.+?)\s*\|\s*(.+?)\s*$/.exec(t)!; blocks.push({ type: "activity", dest: m[1].trim(), q: m[2].trim() }); }
    else buf.push(line);
  }
  closeDetails(); // tolerate an unclosed ::details at end of body
  closeShowcase(); // tolerate an unclosed ::showcase at end of body
  flush();
  return blocks;
}

/** Hotel ids referenced by `::hotel`, `::showcase` and `::compare` — the page pre-fetches these. */
export function hotelIdsInBody(body: string): string[] {
  const single = [...body.matchAll(/^\s*::hotel\s+(\S+)\s*$/gm)].map((m) => m[1]);
  const showcased = [...body.matchAll(/^\s*::showcase\s+(\S+)\s*$/gm)].map((m) => m[1]);
  const compared = [...body.matchAll(/^\s*::compare\s+(.+?)\s*$/gm)].flatMap((m) => m[1].trim().split(/\s+/));
  return [...new Set([...single, ...showcased, ...compared])];
}

/** Hotel ids in `::showcase <id>` — the page fetches up to 6 photos each for the swipable gallery. */
export function showcaseIdsInBody(body: string): string[] {
  return [...new Set([...body.matchAll(/^\s*::showcase\s+(\S+)\s*$/gm)].map((m) => m[1]))];
}

/** Destinations referenced by `::rail <dest>` — the page pre-fetches their hotels. */
export function railDestsInBody(body: string): string[] {
  return [...new Set([...body.matchAll(/^\s*::rail\s+(.+?)\s*$/gm)].map((m) => m[1].trim()))];
}

/** Destinations referenced by `::map <dest>` — the page pre-fetches each one's hotels to plot as pins. */
export function mapDestsInBody(body: string): string[] {
  return [...new Set([...body.matchAll(/^\s*::map\s+(.+?)\s*$/gm)].map((m) => m[1].trim()))];
}

/** Destinations referenced by `::areas <dest>` — the page pre-fetches each area's live hotel count. */
export function areasDestsInBody(body: string): string[] {
  return [...new Set([...body.matchAll(/^\s*::areas\s+(.+?)\s*$/gm)].map((m) => m[1].trim()))];
}

/** Destinations referenced by `::activities <dest>` AND `::activity <dest> | <topic>` — the page resolves a
 *  center lat/lng for each so the Viator rail + per-section offer cards can fetch nearby tours. */
export function activitiesDestsInBody(body: string): string[] {
  const rail = [...body.matchAll(/^\s*::activities\s+(.+?)\s*$/gm)].map((m) => m[1].trim());
  const inline = [...body.matchAll(/^\s*::activity\s+(.+?)\s*\|/gm)].map((m) => m[1].trim());
  return [...new Set([...rail, ...inline])];
}
