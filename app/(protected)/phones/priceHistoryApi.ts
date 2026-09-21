import { CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"

export interface PriceHistoryQuery extends CommonQuery {
  phoneId: string
}

export interface PriceHistoryRow {
  _id: string
  recordedAt: string
  price: number
  reason?: string
  actor?: {
    _id: string
    first_name: string
    last_name: string
    email: string
  }
}

export interface PriceHistoryResponse {
  data: PriceHistoryRow[]
  paginate: {
    total: number
    has_next: boolean
    current_page: number
    total_pages: number
    per_page: number
    has_previous: boolean
    next_page: number | false
    previous_page: number | false
  }
  status: boolean
  message: string
}

export interface UpdateVariantPricePayload {
  phoneId: string
  variantId: string
  official_price?: number
  unofficial_price?: number
  currency?: string
  reason?: string
}

export interface VariantPriceItem {
  variantId: string
  official_price?: number
  unofficial_price?: number
  currency?: string
}

export interface UpdateVariantsPricePayload {
  phoneId: string
  variants: VariantPriceItem[]
  status?: string
  bd_status?: string
  reason?: string
}

export const priceHistoryApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getPhonePriceHistory: build.query<PriceHistoryResponse, PriceHistoryQuery>({
      query: ({ phoneId, ...params }) => ({
        url: `/phones/${phoneId}/price-history`,
        params,
      }),
      providesTags: ["PriceHistory"],
    }),

    updateVariantPrice: build.mutation<
      PriceHistoryResponse,
      UpdateVariantPricePayload
    >({
      query: ({ phoneId, variantId, ...body }) => ({
        url: `/phones/${phoneId}/variants/${variantId}/price`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PriceHistory", "Phone"],
    }),

    updateVariantsPrice: build.mutation<
      PriceHistoryResponse,
      UpdateVariantsPricePayload
    >({
      query: ({ phoneId, ...body }) => ({
        url: `/phones/${phoneId}/variants/price`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PriceHistory", "Phone"],
    }),
  }),
})

export const {
  useGetPhonePriceHistoryQuery,
  useUpdateVariantPriceMutation,
  useUpdateVariantsPriceMutation,
} = priceHistoryApi
