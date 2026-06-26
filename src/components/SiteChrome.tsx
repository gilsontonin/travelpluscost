"use client";

// Hides the live (coral) site chrome on the Apple design-trial routes (/preview/*) so the preview
// renders edge-to-edge in its own design language. Non-destructive: everywhere else is unchanged.
// Children pattern so the gated server components (Header/MemberPitch/Footer) render on the server
// and are merely passed through — a client component must not import server components directly.
import { usePathname } from "next/navigation";

export default function HideOnPreview({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith("/preview")) return null;
  return <>{children}</>;
}
