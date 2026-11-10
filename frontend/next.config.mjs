/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    remotePatterns: [],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/admin/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
