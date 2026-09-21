import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPost } from "./posts.type"
import { PostFormValues } from "./posts.dto"

export const postApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createPost: build.mutation<ApiResponse<IPost>, PostFormValues>({
      query: (body) => ({
        url: `/posts`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),

    getAllPosts: build.query<ApiResponse<IPost[]>, CommonQuery>({
      query: (params) => ({
        url: `/posts`,
        params,
      }),
      providesTags: ["Post"],
    }),

    getPostById: build.query<ApiResponse<IPost>, string>({
      query: (id) => ({
        url: `/posts/${id}`,
      }),
      providesTags: ["Post"],
    }),

    getPostBySlug: build.query<ApiResponse<IPost>, string>({
      query: (slug) => ({
        url: `/posts/public/slug/${slug}`,
      }),
      providesTags: ["Post"],
    }),

    updatePost: build.mutation<
      ApiResponse<IPost>,
      { id: string; body: PostFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/posts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Post"],
    }),

    deletePost: build.mutation<ApiResponse<IPost>, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
})

export const {
  useCreatePostMutation,
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi
