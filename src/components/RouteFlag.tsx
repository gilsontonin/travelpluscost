"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Flags the home route on <html data-home="true|false"> so globals.css can scope the LiteAPI booking-
// assistant chatbot to the home page only — its floating bubble collides with CTA buttons elsewhere.
export default function RouteFlag() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.dataset.home = String(pathname === "/");
  }, [pathname]);
  return null;
}
