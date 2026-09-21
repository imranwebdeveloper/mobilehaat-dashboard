import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IMedia } from "./media.type"

export const mediaApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    // GET ALL MEDIA
    getAllMedia: build.query<ApiResponse<IMedia[]>, CommonQuery>({
      query: (params) => ({
        url: `/media`,
        params,
      }),
      providesTags: ["Media"],
    }),

    // GET MEDIA BY ID (admin — no ownership check)
    getMediaById: build.query<ApiResponse<IMedia>, string>({
      query: (id) => ({
        url: `/admin/user-media/${id}`,
      }),
      providesTags: ["Media"],
    }),

    // UPLOAD MEDIA
    uploadMedia: build.mutation<ApiResponse<IMedia[]>, FormData>({
      query: (body) => ({
        url: `/media`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Media"],
    }),

    // UPDATE MEDIA
    updateMedia: build.mutation<
      ApiResponse<IMedia>,
      { id: string; body: { name?: string; alt?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/media/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Media"],
    }),

    // DELETE SINGLE MEDIA
    deleteMedia: build.mutation<ApiResponse<IMedia>, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Media"],
    }),

    // BULK DELETE
    bulkDeleteMedia: build.mutation<ApiResponse<null>, { ids: string[] }>({
      query: (body) => ({
        url: `/media/bulk-delete`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Media"],
    }),
  }),
})

export const {
  useGetAllMediaQuery,
  useGetMediaByIdQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useBulkDeleteMediaMutation,
} = mediaApi
