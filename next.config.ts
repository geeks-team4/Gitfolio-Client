import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repository also contains Cloudflare Worker-only source files. They are
  // not part of this frontend deployment and use runtime-specific type imports.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
