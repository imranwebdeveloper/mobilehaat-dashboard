import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPostComment } from "./post-comments.type"

export const postCommentApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPostComments: build.query<ApiResponse<IPostComment[]>, CommonQuery>({
      query: (params) => ({
        url: `/post-comments`,
        params,
      }),
      providesTags: ["PostComment"],
    }),

    getPostCommentById: build.query<ApiResponse<IPostComment>, string>({
      query: (id) => ({
        url: `/post-comments/${id}`,
      }),
      providesTags: ["PostComment"],
    }),

    moderatePostComment: build.mutation<
      ApiResponse<IPostComment>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/post-comments/${id}/moderate`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PostComment"],
    }),

    deletePostComment: build.mutation<ApiResponse<IPostComment>, string>({
      query: (id) => ({
        url: `/post-comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PostComment"],
    }),
  }),
})

export const {
  useGetAllPostCommentsQuery,
  useGetPostCommentByIdQuery,
  useModeratePostCommentMutation,
  useDeletePostCommentMutation,
} = postCommentApi
