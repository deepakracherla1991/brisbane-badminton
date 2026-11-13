import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Service worker: always fetch the latest version.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  images: {
    // Add the host of any remote images you reference in src/content/site.ts
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },
};

export default nextConfig;
