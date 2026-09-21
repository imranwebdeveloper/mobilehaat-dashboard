import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IUserMedia } from "./user-media.type"

export const userMediaApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUserMedia: build.query<ApiResponse<IUserMedia[]>, CommonQuery>({
      query: (params) => ({ url: "/admin/user-media", params }),
      providesTags: ["UserMedia"],
    }),
    getUserMediaById: build.query<ApiResponse<IUserMedia>, string>({
      query: (id) => ({ url: `/admin/user-media/${id}` }),
      providesTags: ["UserMedia"],
    }),
    uploadUserMedia: build.mutation<ApiResponse<IUserMedia[]>, FormData>({
      query: (body) => ({
        url: "/user-media",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserMedia"],
    }),
    deleteUserMedia: build.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/user-media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserMedia"],
    }),
    bulkDeleteUserMedia: build.mutation<ApiResponse<null>, { ids: string[] }>({
      query: (body) => ({
        url: "/admin/user-media/bulk-delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["UserMedia"],
    }),
  }),
})

export const {
  useGetAllUserMediaQuery,
  useGetUserMediaByIdQuery,
  useUploadUserMediaMutation,
  useDeleteUserMediaMutation,
  useBulkDeleteUserMediaMutation,
} = userMediaApi
