import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce the minimal Node.js runtime needed by the production Docker image.
  output: "standalone",
  // ali-oss dynamically loads optional proxy support. Keep this Node-only SDK
  // external so Turbopack does not attempt to bundle its runtime requires.
  serverExternalPackages: ["ali-oss"],
};

export default nextConfig;
