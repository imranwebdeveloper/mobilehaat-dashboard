import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const scraperApi = createApi({
  reducerPath: "scraper",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env["SCRAPER_API_URL"],
  }),
  endpoints: () => ({}),
  tagTypes: ["MobileExtraction"],
})
