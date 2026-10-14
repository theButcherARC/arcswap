/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce webpack memory footprint — Vercel hobby builders (2 cores / 8 GB)
  // were OOM-ing during compilation of the heavy wagmi/viem dependency tree.
  experimental: {
    webpackMemoryOptimizations: true,
  },

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/circle-api/:path*",
        destination: "https://api.circle.com/:path*",
      },
    ];
  },
};

export default nextConfig;
