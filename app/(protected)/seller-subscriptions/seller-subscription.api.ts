import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { ISellerSubscription } from "./seller-subscription.type"
import { SubscriptionAssignValues } from "./seller-subscription.dto"
import { SubscriptionStatus } from "./seller-subscription.type"

export const sellerSubscriptionApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    addSubscription: build.mutation<
      ApiResponse<ISellerSubscription>,
      SubscriptionAssignValues
    >({
      query: (body) => ({
        url: `/seller-subscriptions/add-subscription`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SellerSubscription", "Seller"],
    }),

    createPendingSubscription: build.mutation<
      ApiResponse<ISellerSubscription>,
      SubscriptionAssignValues
    >({
      query: (body) => ({
        url: `/seller-subscriptions/pending`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SellerSubscription"],
    }),

    getAllSellerSubscriptions: build.query<
      ApiResponse<ISellerSubscription[]>,
      CommonQuery
    >({
      query: (params) => ({
        url: `/seller-subscriptions`,
        params,
      }),
      providesTags: ["SellerSubscription"],
    }),

    getSellerSubscriptionById: build.query<
      ApiResponse<ISellerSubscription>,
      string
    >({
      query: (id) => ({
        url: `/seller-subscriptions/${id}`,
      }),
      providesTags: ["SellerSubscription"],
    }),

    cancelSellerSubscription: build.mutation<
      ApiResponse<ISellerSubscription>,
      { id: string; body: { immediate?: boolean; reason?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/seller-subscriptions/${id}/cancel`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SellerSubscription"],
    }),

    updateSellerSubscriptionStatus: build.mutation<
      ApiResponse<ISellerSubscription>,
      {
        id: string
        body: {
          status: SubscriptionStatus
          reason?: string
        }
      }
    >({
      query: ({ id, body }) => ({
        url: `/seller-subscriptions/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SellerSubscription"],
    }),

    deleteSellerSubscription: build.mutation<
      ApiResponse<ISellerSubscription>,
      string
    >({
      query: (id) => ({
        url: `/seller-subscriptions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SellerSubscription"],
    }),
  }),
})

export const {
  useAddSubscriptionMutation,
  useCreatePendingSubscriptionMutation,
  useGetAllSellerSubscriptionsQuery,
  useGetSellerSubscriptionByIdQuery,
  useCancelSellerSubscriptionMutation,
  useUpdateSellerSubscriptionStatusMutation,
  useDeleteSellerSubscriptionMutation,
} = sellerSubscriptionApi
