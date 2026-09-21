import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { ISellerPlan } from "./seller-plan.type"
import { SellerPlanFormValues } from "./seller-plan.dto"

export const sellerPlanApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createSellerPlan: build.mutation<
      ApiResponse<ISellerPlan>,
      SellerPlanFormValues
    >({
      query: (body) => ({
        url: `/seller-plans`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SellerPlan"],
    }),

    getAllSellerPlan: build.query<ApiResponse<ISellerPlan[]>, CommonQuery>({
      query: (params) => ({
        url: `/seller-plans`,
        params,
      }),
      providesTags: ["SellerPlan"],
    }),

    getSellerPlanById: build.query<ApiResponse<ISellerPlan>, string>({
      query: (id) => ({
        url: `/seller-plans/${id}`,
      }),
      providesTags: ["SellerPlan"],
    }),

    updateSellerPlan: build.mutation<
      ApiResponse<ISellerPlan>,
      { id: string; body: SellerPlanFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/seller-plans/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SellerPlan"],
    }),

    deleteSellerPlan: build.mutation<ApiResponse<ISellerPlan>, string>({
      query: (id) => ({
        url: `/seller-plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SellerPlan"],
    }),
  }),
})

export const {} = sellerPlanApi
