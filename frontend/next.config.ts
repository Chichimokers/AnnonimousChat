import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath:'/chat',
  assetPrefix:'/chat/',
  allowedDevOrigins:["167.99.238.54","esaki-jrr.com"]
};

export default nextConfig;
