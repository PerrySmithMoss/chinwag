import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const devDomains = ["localhost"];
const prodDomains = ["chinwag-api.perrysmithmoss.com"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [...(isProd ? prodDomains : devDomains), "res.cloudinary.com"],
  },
};

export default nextConfig;
