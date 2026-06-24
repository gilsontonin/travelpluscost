import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, readingMinutes } from "@/lib/posts";
import { relatedSlugs } from "@/lib/relatedPosts";
import { SITE_NAME, abs } from "@/lib/site";
import { parseBlocks, extractHeadings, hotelIdsInBody, railDestsInBody, areasDestsInBody } from "@/lib/blogBody";
import { getDirectoryHotel, searchDirectory, cityHotelCount, type DirectoryHotel } from "@/lib/directory";
import { resolveRegion } from "@/lib/regions";
import type { CardHotel } from "@/lib/hotels";
import PostBody from "@/components/blog/PostBody";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.seoTitle ?? post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [{ url: post.cover.src, width: 1200, height: 675, alt: post.cover.alt }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [post.cover.src] },
  };
}

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// Render a TL;DR takeaway whose lead phrase is **bold** (the rest stays plain).
function PointMd({ text }: { text: string }) {
  const m = /^\*\*(.+?)\*\*(.*)$/.exec(text);
  return m ? (
    <span>
      <strong className="font-semibold text-black">{m[1]}</strong>
      {m[2]}
    </span>
  ) : (
    <span>{text}</span>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `/blog/${post.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
    { name: post.title, path: url },
  ];

  // Parse the body into ordered blocks (Markdown + ::infographic / ::hotel) and pre-fetch any hotel
  // cards from the directory server-side. Headings drive the table of contents.
  const blocks = parseBlocks(post.body);
  const headings = extractHeadings(post.body);
  const hotelEntries = await Promise.all(
    [...new Set(hotelIdsInBody(post.body))].map(async (id) => [id, await getDirectoryHotel(id)] as const),
  );
  const hotels = Object.fromEntries(hotelEntries.filter(([, h]) => h)) as Record<string, DirectoryHotel>;

  // `::rail <dest>` / `::map <dest>` — pre-fetch each area's hotels from the directory (server-side, at build).
  const railEntries = await Promise.all(
    railDestsInBody(post.body).map(async (d) => [d, await searchDirectory(d, 12)] as const),
  );
  const rails = Object.fromEntries(railEntries) as Record<string, CardHotel[]>;

  // `::areas <dest>` — resolve the market to its cities and count each in the live directory.
  const areaEntries = await Promise.all(
    areasDestsInBody(post.body).map(async (d) => {
      const cities = resolveRegion(d)?.cities ?? [];
      const counted = await Promise.all(cities.map(async (city) => ({ city, count: await cityHotelCount(city) })));
      return [d, counted.filter((c) => c.count > 0).sort((a, b) => b.count - a.count)] as const;
    }),
  );
  const areas = Object.fromEntries(areaEntries) as Record<string, { city: string; count: number }[]>;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: post.cover.src,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      author: { "@type": "Organization", name: post.author },
      publisher: { "@type": "Organization", name: SITE_NAME },
      mainEntityOfPage: { "@type": "WebPage", "@id": abs(url) },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: abs(c.path),
      })),
    },
    ...(post.faqs?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-7 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden>›</span>
        <Link href="/blog" className="hover:text-black">Guides</Link>
        <span aria-hidden>›</span>
        <span className="text-black/70 truncate max-w-[60%]">{post.title}</span>
      </nav>

      {/* header */}
      <header className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">{post.category}</span>
        <h1 className="mt-2 text-2xl sm:text-4xl font-bold leading-tight tracking-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-black/55">
          By {post.author} · {fmtDate(post.date)}
          {post.updated && post.updated !== post.date ? ` · Updated ${fmtDate(post.updated)}` : ""} ·{" "}
          {readingMinutes(post.body)} min read
        </p>
      </header>

      {/* cover */}
      <figure className="mt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover.src}
          alt={post.cover.alt}
          width={1200}
          height={675}
          className="w-full rounded-2xl object-cover"
        />
        {post.cover.credit ? (
          <figcaption className="mt-1.5 text-xs text-black/45">
            Photo:{" "}
            <a href={post.cover.credit.url} target="_blank" rel="noopener noreferrer" className="underline">
              {post.cover.credit.name}
            </a>{" "}
            on Unsplash
          </figcaption>
        ) : null}
      </figure>

      {/* TL;DR quick-answer box */}
      {post.tldr ? (
        <div className="mt-7 rounded-2xl border border-accent/20 bg-accent-tint/40 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-accent">The short answer</p>
          <p className="mt-1.5 text-[15.5px] leading-relaxed text-black/85">{post.tldr.answer}</p>
          {post.tldr.points.length ? (
            <ul className="mt-3 space-y-1.5">
              {post.tldr.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-[14.5px] text-black/75">
                  <span className="mt-0.5 text-accent" aria-hidden>✓</span>
                  <PointMd text={pt} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Table of contents */}
      {headings.filter((h) => h.level === 2).length >= 3 ? (
        <nav aria-label="Contents" className="mt-6 rounded-2xl border border-black/[0.08] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-black/45">On this page</p>
          <ul className="mt-2 space-y-1.5">
            {headings
              .filter((h) => h.level === 2)
              .map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-sm text-accent hover:underline">{h.text}</a>
                </li>
              ))}
          </ul>
        </nav>
      ) : null}

      {/* body */}
      <PostBody blocks={blocks} hotels={hotels} rails={rails} areas={areas} />

      {/* CTA */}
      {post.region ? (
        <div className="mt-9 rounded-2xl border border-accent/20 bg-accent-tint/60 p-5 sm:p-6">
          <p className="text-base font-bold text-black">Ready to look at {post.region.name} stays?</p>
          <p className="mt-1 text-sm text-black/70">
            One honest price — the rate plus one small flat fee, the same for everyone.
          </p>
          <Link
            href={`/search?destination=${encodeURIComponent(post.region.destination)}&adults=2`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Search {post.region.name} hotels
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      ) : null}

      {/* FAQ */}
      {post.faqs?.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Frequently asked questions</h2>
          <dl className="mt-4 divide-y divide-black/[0.08]">
            {post.faqs.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold text-black">{f.q}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-black/75">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Related guides — by content similarity, not date */}
      {(() => {
        const related = relatedSlugs(post.slug, 4)
          .map((s) => getPostBySlug(s))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));
        return related.length ? (
          <section className="mt-10 border-t border-black/[0.08] pt-6">
            <h2 className="text-xl font-bold">Related guides</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className="font-medium text-accent hover:underline">
                    {r.title}
                  </Link>
                  <span className="block text-sm text-black/55">{r.excerpt}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null;
      })()}

      <div className="mt-10 border-t border-black/[0.08] pt-5">
        <Link href="/blog" className="text-sm font-medium text-accent hover:underline">
          ← All travel guides
        </Link>
      </div>
    </article>
  );
}
