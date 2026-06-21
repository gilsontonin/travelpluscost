import type { Metadata } from "next";
import CompareClient from "@/components/CompareClient";

// Private tool — shows NET cost; keep it out of search + crawlers.
export const metadata: Metadata = {
  title: "Compare (private)",
  robots: { index: false, follow: false, nocache: true },
};

export default function ComparePage() {
  return <CompareClient />;
}
