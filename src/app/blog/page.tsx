import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, readingMinutes } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Travel guides",
  description:
    "Honest, practical travel guides — where to stay, how to choose, what to skip. No fluff, no surveillance pricing.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Travel guides · travelpluscost",
    description:
      "Honest, practical travel guides — where to stay, how to choose, what to skip.",
    url: "/blog",
  },
};

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Travel guides</h1>
        <p className="mt-1.5 text-sm text-black/60 max-w-xl">
          Where to stay, how to choose, what to skip — written to be useful, not to sell. The same
          honesty we put in our prices.
        </p>
      </header>

      {lead ? (
        <Link
          href={`/blog/${lead.slug}`}
          className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-colors hover:border-black/25 sm:grid sm:grid-cols-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lead.cover.src}
            alt={lead.cover.alt}
            width={1200}
            height={675}
            className="h-56 w-full object-cover sm:h-full"
          />
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{lead.category}</span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold leading-snug group-hover:text-accent">
              {lead.title}
            </h2>
            <p className="mt-2 text-sm text-black/70">{lead.excerpt}</p>
            <p className="mt-4 text-xs text-black/50">
              {fmtDate(lead.date)} · {readingMinutes(lead.body)} min read
            </p>
          </div>
        </Link>
      ) : null}

      {rest.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-colors hover:border-black/25"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.cover.src}
                alt={p.cover.alt}
                width={1200}
                height={675}
                className="h-44 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">{p.category}</span>
                <h2 className="mt-1.5 text-base font-bold leading-snug group-hover:text-accent">{p.title}</h2>
                <p className="mt-1.5 flex-1 text-sm text-black/65">{p.excerpt}</p>
                <p className="mt-3 text-xs text-black/50">
                  {fmtDate(p.date)} · {readingMinutes(p.body)} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
