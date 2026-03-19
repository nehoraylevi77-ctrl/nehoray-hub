import type { NextConfig } from "next";

const MORTGAGE_APP_URL =
  process.env.MORTGAGE_APP_URL ||
  "https://mortgage-analyzer-eu8dordqf-nehoraylevi77-9715s-projects.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/mortgageapp",
        destination: `${MORTGAGE_APP_URL}/`,
      },
      {
        source: "/mortgageapp/:path*",
        destination: `${MORTGAGE_APP_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
