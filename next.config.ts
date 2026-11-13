import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add the host of any remote images you reference in src/content/site.ts
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },
};

export default nextConfig;
