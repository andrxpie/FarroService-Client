const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [BASE_URL, "localhost:3000"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5268/api/:path*",
      },
    ];
  },
};

export default nextConfig;
