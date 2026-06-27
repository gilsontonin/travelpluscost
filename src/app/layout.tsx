import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MemberPitch from "@/components/MemberPitch";
import Footer from "@/components/Footer";
import RouteFlag from "@/components/RouteFlag";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/site";

// Inter is the spec's SF Pro substitute for non-Apple platforms; the CSS stack resolves to real SF Pro
// first on macOS/iOS (see globals.css --font-sans).
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// GA4 + Search Console. The Netlify env var wins (so you can override without a code change); otherwise
// the wired-in GA4 Measurement ID (public, not a secret) loads in PRODUCTION builds only — undefined in
// dev, so local dev never pollutes the analytics. GSC stays env-only (no-op when unset).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? (process.env.NODE_ENV === "production" ? "G-EFH08JNJS3" : undefined);
const GSC = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // No "· travelpluscost" suffix — it overflowed the title budget (blog titles hit 78-80 chars and
    // truncated in Google). Google appends the site name itself from the Organization entity.
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  // NOTE: no `alternates.canonical` here on purpose — a canonical set in the root layout cascades to
  // every page that doesn't override it, pointing them all at "/" and de-indexing the real pages.
  // Each page sets its own canonical; pages without one self-canonicalize to their URL (correct).
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  ...(GSC ? { verification: { google: GSC } } : {}),
};

// Brand entity (Organization) + WebSite with a SearchAction. Establishes travelpluscost as a distinct
// entity (knowledge panel, clean site name, disambiguation from other "TravelPlus" brands) and earns
// the sitelinks search box. Add sameAs (YouTube/X/IG/LinkedIn) once those accounts exist.
const ENTITY_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      description: SITE_DESCRIPTION,
      slogan: SITE_TAGLINE,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?destination={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4f4f6] text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ENTITY_LD) }} />
        <Header />
        <RouteFlag />
        <MemberPitch />
        <main className="flex-1">{children}</main>
        <Footer />
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
