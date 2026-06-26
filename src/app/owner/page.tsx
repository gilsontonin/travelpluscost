import type { Metadata } from "next";
import OwnerDashboard from "@/components/OwnerDashboard";

// Owner-only price scanner. noindex (private). The real gate is server-side: /api/owner/* check OWNER_EMAIL,
// so net never reaches a non-owner even if they load this page.
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Owner" };

export default function OwnerPage() {
  return <OwnerDashboard />;
}
