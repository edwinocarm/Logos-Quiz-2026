import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Turbopack to ignore our older document parsers
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;