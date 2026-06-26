import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MemberPitch from "@/components/MemberPitch";
import Footer from "@/components/Footer";
import HideOnPreview from "@/components/SiteChrome";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Set on Netlify when ready: NEXT_PUBLIC_GA_ID (GA4 "G-…") + NEXT_PUBLIC_GSC_VERIFICATION (Search
// Console HTML-tag token). Both are no-ops when unset, so local dev never loads analytics.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4f4f6] text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ENTITY_LD) }} />
        <HideOnPreview>
          <Header />
          <MemberPitch />
        </HideOnPreview>
        <main className="flex-1">{children}</main>
        <HideOnPreview>
          <Footer />
        </HideOnPreview>
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        {/* LiteAPI Booking Assistant — public (publishable) key, browser-safe to commit. lazyOnload loads
            the third-party widget on idle, off the critical path, so it can't regress LCP / Core Web Vitals. */}
        <Script
          src="https://components.liteapi.travel/chatbot/v1.js?liteApiKey=prod_public_f27848bb-47d8-46ec-915c-ff9e8070fdbc"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
