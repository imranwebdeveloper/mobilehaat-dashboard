import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { INewsletter } from "./newsletter.type"

export const newsletterApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllNewsletter: build.query<ApiResponse<INewsletter[]>, CommonQuery>({
      query: (params) => ({
        url: `/newsletter`,
        params,
      }),
      providesTags: ["Newsletter"],
    }),

    deleteNewsletter: build.mutation<ApiResponse<INewsletter>, string>({
      query: (id) => ({
        url: `/newsletter/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Newsletter"],
    }),

    bulkDeleteNewsletter: build.mutation<
      ApiResponse<INewsletter>,
      { ids: string[] }
    >({
      query: (body) => ({
        url: `/newsletter/bulk-delete`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Newsletter"],
    }),
  }),
})

export const {} = newsletterApi
