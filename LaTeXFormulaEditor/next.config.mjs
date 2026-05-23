/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["mysql2", "mathjax", "sharp"],
  },
};

export default nextConfig;
