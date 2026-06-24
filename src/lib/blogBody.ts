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
  | { type: "hotel"; id: string };

/** Split the body into ordered blocks: Markdown prose, `::infographic <key>`, `::hotel <id>`. */
export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => {
    const t = buf.join("\n").trim();
    if (t) blocks.push({ type: "md", text: t });
    buf = [];
  };
  for (const line of body.split("\n")) {
    const t = line.trim();
    const ig = /^::infographic\s+(\S+)\s*$/.exec(t);
    const ht = /^::hotel\s+(\S+)\s*$/.exec(t);
    if (ig) { flush(); blocks.push({ type: "infographic", key: ig[1] }); }
    else if (ht) { flush(); blocks.push({ type: "hotel", id: ht[1] }); }
    else buf.push(line);
  }
  flush();
  return blocks;
}

/** Hotel ids referenced by `::hotel <id>` — the page pre-fetches these from the directory. */
export function hotelIdsInBody(body: string): string[] {
  return [...body.matchAll(/^\s*::hotel\s+(\S+)\s*$/gm)].map((m) => m[1]);
}
