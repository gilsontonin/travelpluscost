// Render-time entity auto-linker for blog bodies. Links the FIRST in-prose mention of each known
// PROPERTY / CITY / STATE to its static page (/hotels/<city>/<slug>-<id>, /hotels/<city>,
// /destinations/<state>) so every post weaves into the site's internal link graph. First-mention-only:
// the caller threads a shared `linked` Set so each entity links exactly once across the whole post.
//
// Safe by construction — it never touches: heading lines (^#), table rows (^|), directive lines (^::),
// or any text already inside a markdown link. Entities are tried in caller order (properties before
// city before state) and each injected link is protected from later entities, so "El Portal Sedona
// Hotel" links as the property and the "Sedona" inside it is never re-linked as the city.

export interface LinkEntity {
  key: string; // unique id for the shared `linked` set (e.g. the hotel id, "city", "state")
  name: string; // the exact text to match (case-insensitive, whole-word)
  href: string; // the static page to link to
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Link the first eligible mention of each un-linked entity in ONE line. Mutates `linked`. */
export function autolinkLine(line: string, entities: LinkEntity[], linked: Set<string>): string {
  const t = line.trimStart();
  if (!t || /^#{1,6}\s/.test(t) || /^\|/.test(t) || /^::/.test(t)) return line; // skip headings/tables/directives

  // Ranges that must not be linked into: existing markdown links [label](url).
  const blocked: Array<[number, number]> = [];
  for (const m of line.matchAll(/\[[^\]]*\]\([^)]*\)/g)) blocked.push([m.index!, m.index! + m[0].length]);
  const overlaps = (s: number, e: number) => blocked.some(([a, b]) => s < b && e > a);

  const hits: Array<{ start: number; end: number; href: string }> = [];
  for (const ent of entities) {
    if (linked.has(ent.key)) continue;
    const re = new RegExp(`\\b${esc(ent.name)}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      const s = m.index, e = s + m[0].length;
      if (overlaps(s, e)) continue;
      hits.push({ start: s, end: e, href: ent.href });
      blocked.push([s, e]); // protect this span from later (shorter) entities
      linked.add(ent.key);
      break;
    }
  }
  if (!hits.length) return line;
  hits.sort((a, b) => b.start - a.start); // apply right-to-left so indices stay valid
  let out = line;
  for (const h of hits) out = `${out.slice(0, h.start)}[${out.slice(h.start, h.end)}](${h.href})${out.slice(h.end)}`;
  return out;
}

/** Auto-link a whole markdown block, line by line, threading the shared first-mention `linked` set. */
export function autolinkMarkdown(text: string, entities: LinkEntity[], linked: Set<string>): string {
  if (!entities.length) return text;
  return text.split("\n").map((l) => autolinkLine(l, entities, linked)).join("\n");
}
