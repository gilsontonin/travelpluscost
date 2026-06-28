import Link from "next/link";

// Shared shell for the legal/policy pages — readable prose column with consistent typography applied
// to the nested elements (no @tailwindcss/typography dependency).
export default function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-black/55">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span aria-hidden>›</span>
        <span className="text-black/70">{title}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-black/60">Last updated: {updated}</p>

      {intro ? (
        <div className="mt-6 rounded-xl bg-accent-tint/50 p-5 text-[15px] leading-relaxed text-black/75">{intro}</div>
      ) : null}

      <div
        className="mt-8 text-[15px] leading-relaxed text-black/75
          [&_a]:text-accent [&_a]:underline
          [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black
          [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-black
          [&_p]:mb-4
          [&_strong]:font-semibold [&_strong]:text-black
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
      >
        {children}
      </div>
    </div>
  );
}
