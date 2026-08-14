/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@gamer-cv/core",
    "@gamer-cv/data",
    "@gamer-cv/services",
    "@gamer-cv/types",
  ],
  // playwright spawns a real browser process; it must not be bundled into the
  // server build (its optional native deps like kerberos can't be statically
  // resolved by webpack). Externalize so the dynamic import resolves from
  // node_modules at runtime.
  experimental: {
    serverComponentsExternalPackages: ["playwright", "playwright-core", "@prisma/client"],
  },
};

export default nextConfig;
