import { configApi } from "@/config/reduxApiConfig"
import { ApiResponse } from "@/store/global.type"
import {
  PhonePriority,
  PriorityQuery,
  PriorityResponse,
} from "./price-watch.type"

export const priceWatchApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getPriceWatchPriority: build.query<PriorityResponse, PriorityQuery>({
      query: (params) => ({
        url: `/price-watch/priority`,
        params,
      }),
      // "Phone" too, so saving a price from the dialog refreshes the list.
      providesTags: ["PriceWatch", "Phone"],
    }),

    confirmPrice: build.mutation<ApiResponse<PhonePriority>, string>({
      query: (phoneId) => ({
        url: `/price-watch/${phoneId}/confirm`,
        method: "POST",
      }),
      invalidatesTags: ["PriceWatch"],
    }),

    markPriceNotFound: build.mutation<ApiResponse<PhonePriority>, string>({
      query: (phoneId) => ({
        url: `/price-watch/${phoneId}/not-found`,
        method: "POST",
      }),
      invalidatesTags: ["PriceWatch"],
    }),

    markDiscontinued: build.mutation<ApiResponse<unknown>, string>({
      query: (phoneId) => ({
        url: `/phones/${phoneId}`,
        method: "PATCH",
        body: { bd_status: "DISCONTINUED" },
      }),
      invalidatesTags: ["PriceWatch", "Phone"],
    }),
  }),
})

export const {
  useGetPriceWatchPriorityQuery,
  useConfirmPriceMutation,
  useMarkPriceNotFoundMutation,
  useMarkDiscontinuedMutation,
} = priceWatchApi
