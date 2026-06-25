import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, readingMinutes } from "@/lib/posts";
import { relatedSlugs } from "@/lib/relatedPosts";
import { SITE_NAME, abs } from "@/lib/site";
import Image from "next/image";
import { parseBlocks, extractHeadings, hotelIdsInBody, showcaseIdsInBody, railDestsInBody, mapDestsInBody, areasDestsInBody } from "@/lib/blogBody";
import { getDirectoryHotel, searchDirectory, hotelsInArea, cityHotelCount, type DirectoryHotel } from "@/lib/directory";
import { getHotelContent } from "@/lib/hotelContent";
import { resolveRegion } from "@/lib/regions";
import type { CardHotel } from "@/lib/hotels";
import PostBody from "@/components/blog/PostBody";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogStaysList from "@/components/BlogStaysList";
import BlogDatePicks from "@/components/blog/BlogDatePicks";
import BlogStatsStrip from "@/components/blog/BlogStatsStrip";
import BlogStickyCta from "@/components/blog/BlogStickyCta";
import BlogPriceProvider from "@/components/blog/BlogPriceProvider";

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

  // `::showcase <id>` — up to 6 photos per showcased hotel for the swipable gallery. Prefer the directory
  // `images` column once backfilled (npm run blog:images); until then fall back to a build-time LiteAPI
  // fetch (server-side at build, no client JS), then to the single thumbnail. Cheap at a handful per post.
  const showcaseEntries = await Promise.all(
    [...new Set(showcaseIdsInBody(post.body))].map(async (id) => {
      const col = (hotels[id] as (DirectoryHotel & { images?: string[] | null }) | undefined)?.images;
      if (Array.isArray(col) && col.length) return [id, col.slice(0, 6)] as const;
      const content = await getHotelContent(id).catch(() => null);
      const imgs = content?.images?.slice(0, 6) ?? (hotels[id]?.thumbnail ? [hotels[id]!.thumbnail!] : []);
      return [id, imgs] as const;
    }),
  );
  const showcaseImages = Object.fromEntries(showcaseEntries) as Record<string, string[]>;

  // `::rail <dest>` — pre-fetch each rail's hotels (server-side, at build). When the rail names a
  // NEIGHBOURHOOD of the post's city (not the city itself), resolve it city-scoped via hotelsInArea so it
  // returns that area's hotels and never leaks cross-city (a "Strip" text-search would otherwise hit Vegas).
  const cityLc = post.region?.destination.trim().toLowerCase();
  const railEntries = await Promise.all(
    railDestsInBody(post.body).map(
      async (d) =>
        [
          d,
          cityLc && d.trim().toLowerCase() !== cityLc
            ? await hotelsInArea(post.region!.destination, d, 12)
            : await searchDirectory(d, 12),
        ] as const,
    ),
  );
  const rails = Object.fromEntries(railEntries) as Record<string, CardHotel[]>;

  // `::map <dest>` — pre-fetch each map's hotels (more, for a fuller pin spread), city-scoped like rails.
  const mapEntries = await Promise.all(
    mapDestsInBody(post.body).map(
      async (d) =>
        [
          d,
          cityLc && d.trim().toLowerCase() !== cityLc
            ? await hotelsInArea(post.region!.destination, d, 30)
            : await searchDirectory(d, 30),
        ] as const,
    ),
  );
  const maps = Object.fromEntries(mapEntries) as Record<string, CardHotel[]>;

  // `::areas <dest>` — resolve the market to its cities and count each in the live directory.
  const areaEntries = await Promise.all(
    areasDestsInBody(post.body).map(async (d) => {
      const cities = resolveRegion(d)?.cities ?? [];
      const counted = await Promise.all(cities.map(async (city) => ({ city, count: await cityHotelCount(city) })));
      return [d, counted.filter((c) => c.count > 0).sort((a, b) => b.count - a.count)] as const;
    }),
  );
  const areas = Object.fromEntries(areaEntries) as Record<string, { city: string; count: number }[]>;

  // Inventory-intent: a hero rail of the market's top stays, rendered right under the search (above the
  // editorial chrome) so the page goes search → inventory, OTA-style.
  const heroRail: CardHotel[] = post.region ? await searchDirectory(post.region.destination, 10) : [];
  const hotelCount: number = post.region ? await cityHotelCount(post.region.destination) : 0;
  const ratedHero = heroRail.filter((h) => h.rating != null);
  const avgRating: number | null = ratedHero.length
    ? Math.round((ratedHero.reduce((s, h) => s + (h.rating as number), 0) / ratedHero.length) * 10) / 10
    : null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: post.cover.src,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      author: { "@type": "Person", name: post.author, jobTitle: "Founder", worksFor: { "@type": "Organization", name: SITE_NAME } },
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
    <article className="mx-auto max-w-3xl overflow-x-clip px-4 py-7 sm:py-10">
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
        <p className="mt-3 text-sm">
          <span className="text-black/50">By </span>
          <span className="font-semibold text-black/85">{post.author}</span>
          <span className="text-black/55"> · Founder of {SITE_NAME}</span>
        </p>
        <p className="mt-0.5 text-xs text-black/45">
          {fmtDate(post.date)}
          {post.updated && post.updated !== post.date ? ` · Updated ${fmtDate(post.updated)}` : ""} ·{" "}
          {readingMinutes(post.body)} min read
        </p>
      </header>

      {/* Inventory-intent: hero photo + search card overlay (OTA pattern), above the editorial chrome. */}
      {post.region ? (
        <div className="mt-4">
          <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-zinc-100 sm:h-60">
            <Image src={post.cover.src} alt={post.cover.alt} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
          <div className="relative z-10 -mt-14 sm:-mt-16">
            <BlogSearch dest={post.region.destination} />
          </div>
          {post.cover.credit ? (
            <p className="mt-1.5 text-right text-xs text-black/40">
              Photo:{" "}
              {post.cover.credit.url ? (
                <a href={post.cover.credit.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {post.cover.credit.name}
                </a>
              ) : (
                post.cover.credit.name
              )}
              {post.cover.credit.url?.includes("unsplash.com") ? " on Unsplash" : ""}
            </p>
          ) : null}
          <BlogStatsStrip city={post.region.name} hotelCount={hotelCount} avgRating={avgRating} />
        </div>
      ) : null}
      {post.region ? <BlogDatePicks destination={post.region.destination} /> : null}
      {post.region && heroRail.length ? (
        <BlogStaysList
          title={`Top-rated stays in ${post.region.name}`}
          subtitle="One honest price — the rate plus one flat fee, the same for everyone"
          hotels={heroRail}
          seeAllHref={`/search?destination=${encodeURIComponent(post.region.destination)}&adults=2`}
        />
      ) : null}

      {/* cover — non-region posts only (region posts show it as the hero above the search) */}
      {!post.region ? (
      <figure className="mt-5">
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          width={1200}
          height={675}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full rounded-2xl object-cover"
        />
        {post.cover.credit ? (
          <figcaption className="mt-1.5 text-xs text-black/45">
            Photo:{" "}
            {post.cover.credit.url ? (
              <a href={post.cover.credit.url} target="_blank" rel="noopener noreferrer" className="underline">
                {post.cover.credit.name}
              </a>
            ) : (
              <span>{post.cover.credit.name}</span>
            )}
            {post.cover.credit.url?.includes("unsplash.com") ? " on Unsplash" : ""}
          </figcaption>
        ) : null}
      </figure>
      ) : null}

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
      <BlogPriceProvider ids={Object.keys(hotels)}>
        <PostBody blocks={blocks} hotels={hotels} rails={rails} maps={maps} areas={areas} showcaseImages={showcaseImages} />
      </BlogPriceProvider>

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

      {post.region ? (
        <BlogStickyCta city={post.region.name} href={`/search?destination=${encodeURIComponent(post.region.destination)}&adults=2`} />
      ) : null}
    </article>
  );
}
