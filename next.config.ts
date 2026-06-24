import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Writer",
  images: { unoptimized: true },
};

export default nextConfig;
