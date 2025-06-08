import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const devDomains = ["localhost"];
const prodDomains = ["chinwag-api.perrysmithmoss.com"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [...(isProd ? prodDomains : devDomains), "res.cloudinary.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
