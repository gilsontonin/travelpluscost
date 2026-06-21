import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "travelpluscost — one honest price",
  description:
    "Hotels at cost, plus one small flat fee — the same price for everyone, never based on your data.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <header className="border-b border-black/5">
          <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-0.5 font-semibold text-lg">
              <span className="text-accent">travel</span>
              <span>pluscost</span>
            </Link>
            <span className="hidden sm:block text-sm text-black/60">
              One honest price. The same for everyone.
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/5 mt-16">
          <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-black/60 space-y-2">
            <p className="font-medium text-black/80">How our pricing works</p>
            <p className="max-w-2xl">
              What the hotel charges us, plus one small flat fee — the same price for you, your mom,
              and your cousin. Same number from any phone, any city, any day. We never use your data
              to set it.
            </p>
            <p className="text-black/40">© {new Date().getFullYear()} travelpluscost · prototype</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
