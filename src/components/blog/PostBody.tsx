import { isValidElement, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Infographic from "./Infographic";
import BlogHotelCard from "./BlogHotelCard";
import ShowcaseHotel from "./ShowcaseHotel";
import ViatorPackages from "@/components/ViatorPackages";
import PriceProof from "./PriceProof";
import CtaWidget from "./CtaWidget";
import BlogSearch from "./BlogSearch";
import BlogMap from "./BlogMap";
import BlogCompare from "./BlogCompare";
import BlogAreas from "./BlogAreas";
import HotelRail from "@/components/HotelRail";
import { slugify, type Block } from "@/lib/blogBody";
import { hotelHref } from "@/lib/hotelUrl";
import { autolinkMarkdown, type LinkEntity } from "@/lib/autolink";
import type { DirectoryHotel } from "@/lib/directory";
import type { CardHotel } from "@/lib/hotels";

// Flatten heading children to a plain string so we can give H2/H3 stable anchor ids (for the ToC).
function textOf(c: ReactNode): string {
  if (typeof c === "string" || typeof c === "number") return String(c);
  if (Array.isArray(c)) return c.map(textOf).join("");
  if (isValidElement(c)) return textOf((c.props as { children?: ReactNode }).children);
  return "";
}

const mdComponents: Components = {
  h2: ({ children }) => (
    <h2 id={slugify(textOf(children))} className="mt-9 mb-1 scroll-mt-24 text-xl font-bold text-black">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugify(textOf(children))} className="mt-6 mb-1 scroll-mt-24 text-lg font-semibold text-black">{children}</h3>
  ),
  p: ({ children }) => <p>{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
  a: ({ href, children }) => {
    const h = href ?? "";
    return h.startsWith("/") || h.startsWith("#") ? (
      <Link href={h} className="font-medium text-accent underline underline-offset-2">{children}</Link>
    ) : (
      <a href={h} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">{children}</a>
    );
  },
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-black/15 text-left">{children}</thead>,
  th: ({ children }) => <th className="py-2 pr-4 font-semibold text-black">{children}</th>,
  td: ({ children }) => <td className="border-b border-black/[0.06] py-2 pr-4 align-top">{children}</td>,
};

// Renders a post body: Markdown prose interleaved with `::infographic` / `::hotel` blocks, in order.
export default function PostBody({
  blocks,
  hotels,
  rails,
  maps,
  areas,
  showcaseImages = {},
  activitiesCoords = {},
  cityLink = null,
  stateLink = null,
}: {
  blocks: Block[];
  hotels: Record<string, DirectoryHotel>;
  rails: Record<string, CardHotel[]>;
  maps: Record<string, CardHotel[]>;
  areas: Record<string, { city: string; count: number }[]>;
  showcaseImages?: Record<string, string[]>;
  activitiesCoords?: Record<string, { lat: number; lng: number }>;
  cityLink?: { name: string; href: string } | null;
  stateLink?: { name: string; href: string } | null;
}) {
  // Entity auto-linking: the first in-prose mention of each property/city/state links to its static
  // page. Properties come from the hotels we have cards for (always have a page); the city/state targets
  // are resolved + existence-checked by the PAGE (so an island like Maui with no /hotels/maui hub passes
  // null and is never linked). `linked` is threaded across blocks in document order = first mention only.
  const entities: LinkEntity[] = [
    ...Object.values(hotels)
      .filter((h) => h.name && h.name.length >= 7)
      .map((h) => ({ key: h.id, name: h.name, href: hotelHref(h) }))
      .sort((a, b) => b.name.length - a.name.length),
    ...(cityLink ? [{ key: "city", name: cityLink.name, href: cityLink.href }] : []),
    ...(stateLink ? [{ key: "state", name: stateLink.name, href: stateLink.href }] : []),
  ];
  const linked = new Set<string>();
  const link = (text: string) => autolinkMarkdown(text, entities, linked);
  return (
    <div className="mt-7 space-y-4 text-[15.5px] leading-relaxed text-black/80">
      {blocks.map((b, i) => {
        if (b.type === "infographic") return <Infographic key={i} id={b.key} />;
        if (b.type === "priceproof") return <PriceProof key={i} />;
        if (b.type === "cta") return <CtaWidget key={i} dest={b.dest} />;
        if (b.type === "search") return <BlogSearch key={i} dest={b.dest} />;
        if (b.type === "rail") {
          const hs = rails[b.dest] ?? [];
          return hs.length ? (
            <HotelRail
              key={i}
              title={`Stays in ${b.dest}`}
              subtitle="One honest price — the rate plus one flat fee, the same for everyone"
              hotels={hs}
              seeAllHref={`/search?destination=${encodeURIComponent(b.dest)}&adults=2`}
            />
          ) : null;
        }
        if (b.type === "map") return <BlogMap key={i} dest={b.dest} hotels={maps[b.dest] ?? []} />;
        if (b.type === "areas") return <BlogAreas key={i} dest={b.dest} areas={areas[b.dest] ?? []} />;
        if (b.type === "activities") {
          const c = activitiesCoords[b.dest];
          return <ViatorPackages key={i} lat={c?.lat} lng={c?.lng} />;
        }
        if (b.type === "details")
          return (
            <details key={i} className="group my-5 rounded-2xl border border-black/[0.08]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-black [&::-webkit-details-marker]:hidden">
                <span>{b.summary}</span>
                <span className="shrink-0 text-xs font-medium text-accent group-open:hidden">Read more +</span>
                <span className="hidden shrink-0 text-xs font-medium text-accent group-open:inline">Show less −</span>
              </summary>
              <div className="space-y-3 px-4 pb-4 text-[15.5px] leading-relaxed text-black/80">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{b.text}</ReactMarkdown>
              </div>
            </details>
          );
        if (b.type === "compare") {
          const hs = b.ids.map((id) => hotels[id]).filter(Boolean) as DirectoryHotel[];
          return <BlogCompare key={i} hotels={hs} />;
        }
        if (b.type === "showcase") {
          const h = hotels[b.id];
          return h ? (
            <ShowcaseHotel key={i} hotel={h} images={showcaseImages[b.id] ?? []}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{link(b.text)}</ReactMarkdown>
            </ShowcaseHotel>
          ) : null;
        }
        if (b.type === "hotel") {
          const h = hotels[b.id];
          return h ? <BlogHotelCard key={i} hotel={h} /> : null;
        }
        return (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={mdComponents}>
            {link(b.text)}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
