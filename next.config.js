const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    middlewareClientMaxBodySize: "100mb"
  }
};

module.exports = nextConfig;
