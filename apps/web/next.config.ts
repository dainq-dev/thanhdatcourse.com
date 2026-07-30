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
  async redirects() {
    return [
      {
        source: "/quan-tri-vien/bai-viet/tao-bai-viet",
        destination: "/quan-tri-vien/bai-viet/tao-moi",
        permanent: true,
      },
      {
        source: "/quan-tri-vien/bai-viet/chinh-sua-bai-viet",
        destination: "/quan-tri-vien/bai-viet",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
