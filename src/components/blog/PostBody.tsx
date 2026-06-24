import { isValidElement, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Infographic from "./Infographic";
import BlogHotelCard from "./BlogHotelCard";
import { slugify, type Block } from "@/lib/blogBody";
import type { DirectoryHotel } from "@/lib/directory";

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
}: {
  blocks: Block[];
  hotels: Record<string, DirectoryHotel>;
}) {
  return (
    <div className="mt-7 space-y-4 text-[15.5px] leading-relaxed text-black/80">
      {blocks.map((b, i) => {
        if (b.type === "infographic") return <Infographic key={i} id={b.key} />;
        if (b.type === "hotel") {
          const h = hotels[b.id];
          return h ? <BlogHotelCard key={i} hotel={h} /> : null;
        }
        return (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={mdComponents}>
            {b.text}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
