import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce the minimal Node.js runtime needed by the production Docker image.
  output: "standalone",
};

export default nextConfig;
