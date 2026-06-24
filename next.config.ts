import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // LiteAPI photos are served full-res (~680 KB each) from this host with no resize
    // params. Routing them through next/image (Netlify Image CDN in prod) resizes +
    // converts to WebP/AVIF, so a card thumbnail ships ~30 KB instead of 680 KB.
    remotePatterns: [{ protocol: "https", hostname: "static.cupid.travel" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Next 16 requires every quality used by next/image to be whitelisted here, or the request
    // falls back. Cards use 65 (smaller); 75 is the default. Keep in sync with the components.
    qualities: [65, 75],
  },
};

export default nextConfig;
