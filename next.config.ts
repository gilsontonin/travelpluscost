import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // LiteAPI photos are served full-res (~680 KB each) from this host with no resize
    // params. Routing them through next/image (Netlify Image CDN in prod) resizes +
    // converts to WebP/AVIF, so a card thumbnail ships ~30 KB instead of 680 KB.
    remotePatterns: [{ protocol: "https", hostname: "static.cupid.travel" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
