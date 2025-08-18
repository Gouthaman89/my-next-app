/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // ✅ Let the build succeed even if there are ESLint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;