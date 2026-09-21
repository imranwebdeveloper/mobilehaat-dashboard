export const config = {
  env: {
    API_URL: process.env["API_URL"],
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
