import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for wagmi / viem — they use browser-only APIs
  // that must not be bundled server-side.
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },

  // Allow images from token logo CDNs as needed.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
