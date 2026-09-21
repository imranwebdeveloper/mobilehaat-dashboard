import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPhoneCategory } from "./phone-category.type"
import { PhoneCategoryFormValues } from "./phone-category.dto"

export const phoneCategoryApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createPhoneCategory: build.mutation<
      ApiResponse<IPhoneCategory>,
      PhoneCategoryFormValues
    >({
      query: (body) => ({
        url: `/phone-categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PhoneCategory"],
    }),

    getAllPhoneCategory: build.query<
      ApiResponse<IPhoneCategory[]>,
      CommonQuery
    >({
      query: (params) => ({
        url: `/phone-categories`,
        params,
      }),
      providesTags: ["PhoneCategory"],
    }),

    getPhoneCategoryById: build.query<ApiResponse<IPhoneCategory>, string>({
      query: (id) => ({
        url: `/phone-categories/${id}`,
      }),
      providesTags: ["PhoneCategory"],
    }),

    updatePhoneCategory: build.mutation<
      ApiResponse<IPhoneCategory>,
      { id: string; body: PhoneCategoryFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/phone-categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PhoneCategory"],
    }),

    deletePhoneCategory: build.mutation<ApiResponse<IPhoneCategory>, string>({
      query: (id) => ({
        url: `/phone-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PhoneCategory"],
    }),
  }),
})

export const {} = phoneCategoryApi
