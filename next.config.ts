const ip = process.env.IP_ADDRESS;

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [ip],
};

export default nextConfig;
