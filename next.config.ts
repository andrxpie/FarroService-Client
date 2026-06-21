import type { NextConfig } from "next";

// BACKEND_URL drives the /api/* proxy. It is read at build time, so it must exist
// during the Vercel build — fall back to the deployed backend if the env var is unset
// (e.g. when no Vercel Environment Variable is configured) so the build never breaks.
const backendUrl = process.env.BACKEND_URL ?? "https://farro-service-api.onrender.com";

// Dev-only setting; filter out an undefined value so it doesn't warn/break in CI.
const browserUrl = process.env.BROWSER_URL;

const nextConfig: NextConfig = {
  allowedDevOrigins: browserUrl ? [browserUrl] : [],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
