import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IBestPhone } from "./best-phones.type"
import { BestPhoneFormValues } from "./best-phones.dto"

export const bestPhoneApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createBestPhone: build.mutation<
      ApiResponse<IBestPhone>,
      BestPhoneFormValues
    >({
      query: (body) => ({
        url: `/best-phones`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BestPhone"],
    }),

    getAllBestPhone: build.query<ApiResponse<IBestPhone[]>, CommonQuery>({
      query: (params) => ({
        url: `/best-phones`,
        params,
      }),
      providesTags: ["BestPhone"],
    }),

    getBestPhoneById: build.query<ApiResponse<IBestPhone>, string>({
      query: (id) => ({
        url: `/best-phones/${id}`,
      }),
      providesTags: ["BestPhone"],
    }),

    updateBestPhone: build.mutation<
      ApiResponse<IBestPhone>,
      { id: string; body: BestPhoneFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/best-phones/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BestPhone"],
    }),

    deleteBestPhone: build.mutation<ApiResponse<IBestPhone>, string>({
      query: (id) => ({
        url: `/best-phones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BestPhone"],
    }),
  }),
})

export const {
  useCreateBestPhoneMutation,
  useGetAllBestPhoneQuery,
  useGetBestPhoneByIdQuery,
  useLazyGetBestPhoneByIdQuery,
  useUpdateBestPhoneMutation,
  useDeleteBestPhoneMutation,
} = bestPhoneApi
