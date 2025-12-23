/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: [] }
  },
  async redirects() {
    return [
      {
        source: "/verification",
        destination: "/verify",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
