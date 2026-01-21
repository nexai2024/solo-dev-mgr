import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  typescript: {
    // Note: During development you may want to set this to false for faster iteration
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
