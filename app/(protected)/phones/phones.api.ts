import { ApiResponse } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPhone, PhoneQuery } from "./phones.type"
import { PhoneFormValues } from "./phones.dto"

export const phoneApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createPhone: build.mutation<ApiResponse<IPhone>, PhoneFormValues>({
      query: (body) => ({
        url: `/phones`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Phone"],
    }),

    getAllPhone: build.query<ApiResponse<IPhone[]>, PhoneQuery>({
      query: (params) => ({
        url: `/phones`,
        params,
      }),
      providesTags: ["Phone"],
    }),

    getPhoneById: build.query<ApiResponse<IPhone>, string>({
      query: (id) => ({
        url: `/phones/${id}`,
      }),
      providesTags: ["Phone"],
    }),

    updatePhone: build.mutation<
      ApiResponse<IPhone>,
      { id: string; body: PhoneFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/phones/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Phone"],
    }),

    deletePhone: build.mutation<ApiResponse<IPhone>, string>({
      query: (id) => ({
        url: `/phones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Phone"],
    }),
  }),
})

export const {
  useCreatePhoneMutation,
  useGetAllPhoneQuery,
  useGetPhoneByIdQuery,
  useUpdatePhoneMutation,
  useDeletePhoneMutation,
} = phoneApi
