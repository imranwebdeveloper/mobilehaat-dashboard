import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const scraperApi = createApi({
  reducerPath: "scraper",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env["SCRAPER_API_URL"],
    prepareHeaders: (headers) => {
      const apiKey = process.env["API_KEY"]
      if (apiKey) {
        headers.set("x-api-key", apiKey)
      }
      return headers
    },
  }),
  endpoints: () => ({}),
  tagTypes: ["MobileExtraction"],
})
