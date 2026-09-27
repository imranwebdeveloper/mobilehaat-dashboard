const isServer = typeof window === "undefined"

export const config = {
  env: {
    // Server-side: prefer direct service addresses (no TLS hairpin through
    // Caddy). Browsers always use the public build-time URLs.
    API_URL:
      (isServer && process.env["API_URL_INTERNAL"]) ||
      process.env["API_URL"],
    SCRAPER_API_URL:
      (isServer && process.env["SCRAPER_API_URL_INTERNAL"]) ||
      process.env["SCRAPER_API_URL"],
    API_KEY: process.env["API_KEY"],
    NEXTAUTH_SECRET: `${process.env["NEXTAUTH_SECRET"]}`,
    NEXTAUTH_URL: `${process.env["NEXTAUTH_URL"]}`,
    // lOCAL_TOKEN_NAME: `${process.env["TOKEN_NAME"]}`,
    // DOMAIN: `${process.env["DOMAIN"]}`,
    // FULL_DOMAIN_URL: `${process.env["FULL_DOMAIN_URL"]}`,
    // LOGO: `${process.env["LOGO"]}`,
  },
  headers: (() => {
    const headers: Record<string, string> = {}
    if (process.env["API_KEY"]) {
      headers["x-api-key"] = process.env["API_KEY"]
    }
    return headers
  })(),
  // email: "mobilesellerbd@gmail.com",

  // google analytics and Tag managers
}
