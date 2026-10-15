import { configApi } from "@/config/reduxApiConfig"
import { ApiResponse } from "@/store/global.type"
import {
  CalculateExpectedBody,
  ExpectedCalculation,
  ExpectedDefaults,
  PhonePriority,
  PriorityQuery,
  PriorityResponse,
  SaveExpectedPriceBody,
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

    getExpectedDefaults: build.query<ApiResponse<ExpectedDefaults>, null>({
      query: () => ({ url: `/price-watch/expected-price/defaults` }),
    }),

    calculateExpected: build.mutation<
      ApiResponse<ExpectedCalculation>,
      CalculateExpectedBody
    >({
      query: (body) => ({
        url: `/price-watch/expected-price/calculate`,
        method: "POST",
        body,
      }),
    }),

    saveExpectedPrice: build.mutation<
      ApiResponse<PhonePriority>,
      { phoneId: string; body: SaveExpectedPriceBody }
    >({
      query: ({ phoneId, body }) => ({
        url: `/price-watch/${phoneId}/expected-price`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PriceWatch", "Phone"],
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
  useGetExpectedDefaultsQuery,
  useCalculateExpectedMutation,
  useSaveExpectedPriceMutation,
} = priceWatchApi
