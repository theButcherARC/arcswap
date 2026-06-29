/** @type {import('next').NextConfig} */
const nextConfig = {
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