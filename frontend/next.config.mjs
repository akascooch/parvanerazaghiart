/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
