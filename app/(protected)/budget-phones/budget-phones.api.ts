import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IBudgetPhone } from "./budget-phones.type"
import { BudgetPhoneFormValues } from "./budget-phones.dto"

export const budgetPhoneApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createBudgetPhone: build.mutation<
      ApiResponse<IBudgetPhone>,
      BudgetPhoneFormValues
    >({
      query: (body) => ({
        url: `/budget-phones`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BudgetPhone"],
    }),

    getAllBudgetPhone: build.query<ApiResponse<IBudgetPhone[]>, CommonQuery>({
      query: (params) => ({
        url: `/budget-phones`,
        params,
      }),
      providesTags: ["BudgetPhone"],
    }),

    getBudgetPhoneById: build.query<ApiResponse<IBudgetPhone>, string>({
      query: (id) => ({
        url: `/budget-phones/${id}`,
      }),
      providesTags: ["BudgetPhone"],
    }),

    updateBudgetPhone: build.mutation<
      ApiResponse<IBudgetPhone>,
      { id: string; body: BudgetPhoneFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/budget-phones/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BudgetPhone"],
    }),

    deleteBudgetPhone: build.mutation<ApiResponse<IBudgetPhone>, string>({
      query: (id) => ({
        url: `/budget-phones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BudgetPhone"],
    }),
  }),
})

export const {
  useCreateBudgetPhoneMutation,
  useGetAllBudgetPhoneQuery,
  useGetBudgetPhoneByIdQuery,
  useLazyGetBudgetPhoneByIdQuery,
  useUpdateBudgetPhoneMutation,
  useDeleteBudgetPhoneMutation,
} = budgetPhoneApi
