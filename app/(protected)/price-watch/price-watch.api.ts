import { configApi } from "@/config/reduxApiConfig"
import { PriorityQuery, PriorityResponse } from "./price-watch.type"

export const priceWatchApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getPriceWatchPriority: build.query<PriorityResponse, PriorityQuery>({
      query: (params) => ({
        url: `/price-watch/priority`,
        params,
      }),
    }),
  }),
})

export const { useGetPriceWatchPriorityQuery } = priceWatchApi
