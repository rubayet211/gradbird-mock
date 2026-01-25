/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ufscdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ufscdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
