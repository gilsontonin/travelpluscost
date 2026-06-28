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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Travel guides</h1>
        <p className="mt-1.5 text-sm text-black/60 max-w-xl">
          Where to stay, how to choose, what to skip — written to be useful, not to sell. The same
          honesty we put in our prices.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-card shadow-card transition hover:shadow-pop"
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
              <p className="mt-3 text-xs text-black/60">
                {fmtDate(p.date)} · {readingMinutes(p.body)} min read
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
