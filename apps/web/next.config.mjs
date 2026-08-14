/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@gamer-cv/core",
    "@gamer-cv/data",
    "@gamer-cv/services",
    "@gamer-cv/types",
  ],
};

export default nextConfig;
