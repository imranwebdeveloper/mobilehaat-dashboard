import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { ISeller } from "./seller.type"
import { ISellerSubscription } from "../seller-subscriptions/seller-subscription.type"
import { ISellerOffer } from "../seller-offers/seller-offer.type"
import { IPaymentRecord } from "../payment-records/payment-record.type"
import {
  SellerStatusFormValues,
  SellerSubmitValues,
  SellerVerificationFormValues,
} from "./seller.dto"

export const sellerApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createSeller: build.mutation<ApiResponse<ISeller>, SellerSubmitValues>({
      query: (body) => ({
        url: `/admin/sellers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Seller"],
    }),

    getAllSellers: build.query<ApiResponse<ISeller[]>, CommonQuery>({
      query: (params) => ({
        url: `/admin/sellers`,
        params,
      }),
      providesTags: ["Seller"],
    }),

    getSellerById: build.query<ApiResponse<ISeller>, string>({
      query: (id) => ({
        url: `/admin/sellers/${id}`,
      }),
      providesTags: ["Seller"],
    }),

    updateSeller: build.mutation<
      ApiResponse<ISeller>,
      { id: string; body: Omit<SellerSubmitValues, "user_id"> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/sellers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Seller"],
    }),

    updateSellerStatus: build.mutation<
      ApiResponse<ISeller>,
      { id: string; body: SellerStatusFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/admin/sellers/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Seller"],
    }),

    updateSellerVerification: build.mutation<
      ApiResponse<ISeller>,
      { id: string; body: SellerVerificationFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/admin/sellers/${id}/verification`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Seller"],
    }),

    getSellerSubscriptions: build.query<
      ApiResponse<ISellerSubscription[]>,
      string
    >({
      query: (sellerId) => ({
        url: `/seller-subscriptions/seller/${sellerId}`,
      }),
      providesTags: ["SellerSubscription"],
    }),

    getSellerOffers: build.query<
      ApiResponse<ISellerOffer[]>,
      { sellerId: string; status?: string }
    >({
      query: ({ sellerId, status }) => ({
        url: `/admin/seller-offers`,
        params: { seller_id: sellerId, status },
      }),
      providesTags: ["SellerOffer"],
    }),

    getSellerPayments: build.query<
      ApiResponse<IPaymentRecord[]>,
      string
    >({
      query: (sellerId) => ({
        url: `/payment-records`,
        params: { seller_id: sellerId, limit: 20 },
      }),
      providesTags: ["PaymentRecord"],
    }),
  }),
})

export const {
  useCreateSellerMutation,
  useGetAllSellersQuery,
  useGetSellerByIdQuery,
  useLazyGetSellerByIdQuery,
  useUpdateSellerMutation,
  useUpdateSellerStatusMutation,
  useUpdateSellerVerificationMutation,
  useGetSellerSubscriptionsQuery,
  useGetSellerOffersQuery,
  useGetSellerPaymentsQuery,
} = sellerApi
