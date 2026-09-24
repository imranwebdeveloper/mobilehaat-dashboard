/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,

  // NOTE: `env` entries are inlined into bundles at build time — including
  // client bundles that import config/* (RTK Query runs in the browser).
  // API_URL / SCRAPER_API_URL / API_KEY are therefore BUILD-TIME values.
  // NEXTAUTH_URL and NEXTAUTH_SECRET stay out: next-auth reads them from
  // process.env at runtime.
  env: {
    API_URL: process.env.API_URL,
    SCRAPER_API_URL: process.env.SCRAPER_API_URL,
  },

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
}

export default nextConfig
