import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minhtravel.vn",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
