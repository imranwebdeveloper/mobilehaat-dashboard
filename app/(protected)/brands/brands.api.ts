import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IBrand } from "./brands.type"
import { BrandFormValues } from "./brands.dto"

export const brandApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createBrand: build.mutation<ApiResponse<IBrand>, BrandFormValues>({
      query: (body) => ({
        url: `/brands`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Brand"],
    }),

    getAllBrand: build.query<ApiResponse<IBrand[]>, CommonQuery>({
      query: (params) => ({
        url: `/brands`,
        params,
      }),
      providesTags: ["Brand"],
    }),

    getBrandById: build.query<ApiResponse<IBrand>, string>({
      query: (id) => ({
        url: `/brands/${id}`,
      }),
      providesTags: ["Brand"],
    }),

    updateBrand: build.mutation<
      ApiResponse<IBrand>,
      { id: string; body: BrandFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Brand"],
    }),

    deleteBrand: build.mutation<ApiResponse<IBrand>, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
})

export const {} = brandApi
