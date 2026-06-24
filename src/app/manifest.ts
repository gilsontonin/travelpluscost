import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f6",
    theme_color: "#ff385c",
    icons: [
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
