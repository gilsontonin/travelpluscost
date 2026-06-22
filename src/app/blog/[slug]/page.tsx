import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPostBySlug, readingMinutes } from "@/lib/posts";
import { SITE_NAME, abs } from "@/lib/site";

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
    title: post.title,
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

      {/* body */}
      <div className="mt-7 space-y-4 text-[15.5px] leading-relaxed text-black/80">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => <h2 className="mt-9 mb-1 text-xl font-bold text-black">{children}</h2>,
            h3: ({ children }) => <h3 className="mt-6 mb-1 text-lg font-semibold text-black">{children}</h3>,
            p: ({ children }) => <p>{children}</p>,
            ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>,
            strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
            a: ({ href, children }) => {
              const h = href ?? "";
              return h.startsWith("/") || h.startsWith("#") ? (
                <Link href={h} className="font-medium text-accent underline underline-offset-2">{children}</Link>
              ) : (
                <a href={h} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">
                  {children}
                </a>
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
          }}
        >
          {post.body}
        </ReactMarkdown>
      </div>

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

      <div className="mt-10 border-t border-black/[0.08] pt-5">
        <Link href="/blog" className="text-sm font-medium text-accent hover:underline">
          ← All travel guides
        </Link>
      </div>
    </article>
  );
}
