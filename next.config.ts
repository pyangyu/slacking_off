import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Set basePath if deploying to github.io/repo-name
  // basePath: "/slacking-off-app",
};

export default nextConfig;
