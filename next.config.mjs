/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mobilehaat.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "phonehaat.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL,
    SCRAPER_API_URL: process.env.SCRAPER_API_URL,
  },
}

export default nextConfig
