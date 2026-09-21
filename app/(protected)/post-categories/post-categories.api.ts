import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPostCategory } from "./post-categories.type"
import { PostCategoryFormValues } from "./post-categories.dto"

export const postCategoryApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createPostCategory: build.mutation<
      ApiResponse<IPostCategory>,
      PostCategoryFormValues
    >({
      query: (body) => ({
        url: `/post-categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    getAllPostCategory: build.query<ApiResponse<IPostCategory[]>, CommonQuery>({
      query: (params) => ({
        url: `/post-categories`,
        params,
      }),
      providesTags: ["Category"],
    }),

    getPostCategoryById: build.query<ApiResponse<IPostCategory>, string>({
      query: (id) => ({
        url: `/post-categories/${id}`,
      }),
      providesTags: ["Category"],
    }),

    updatePostCategory: build.mutation<
      ApiResponse<IPostCategory>,
      { id: string; body: PostCategoryFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/post-categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    deletePostCategory: build.mutation<ApiResponse<IPostCategory>, string>({
      query: (id) => ({
        url: `/post-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
})

export const {} = postCategoryApi
