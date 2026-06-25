import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // LiteAPI photos are served full-res (~680 KB each) from this host with no resize
    // params. Routing them through next/image (Netlify Image CDN in prod) resizes +
    // converts to WebP/AVIF, so a card thumbnail ships ~30 KB instead of 680 KB.
    remotePatterns: [
      { protocol: "https", hostname: "static.cupid.travel" },
      { protocol: "https", hostname: "images.unsplash.com" }, // blog cover photos
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Cap the largest generated width at 1920. Next's default deviceSizes run up to 3840 (4K), and GSC
    // crawl stats showed Googlebot re-fetching hotel photos at w=3840 — ~97% of the daily crawl bandwidth
    // (≈19.6 GB/day). Hotel photos don't need 4K; 1920 covers full-HD/Retina heros, ~quarters the bytes of
    // every large image, and improves LCP. Cards/thumbnails already request small widths via their `sizes`.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Next 16 requires every quality used by next/image to be whitelisted here, or the request
    // falls back. Cards use 65 (smaller); 75 is the default. Keep in sync with the components.
    qualities: [65, 75],
  },
};

export default nextConfig;
