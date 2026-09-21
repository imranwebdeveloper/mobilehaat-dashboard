import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IAuthor } from "./authors.type"
import { AuthorFormValues } from "./authors.dto"

export const authorApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createAuthor: build.mutation<ApiResponse<IAuthor>, AuthorFormValues>({
      query: (body) => ({
        url: `/authors`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Author"],
    }),

    getAllAuthors: build.query<ApiResponse<IAuthor[]>, CommonQuery>({
      query: (params) => ({
        url: `/authors`,
        params,
      }),
      providesTags: ["Author"],
    }),

    getAuthorById: build.query<ApiResponse<IAuthor>, string>({
      query: (id) => ({
        url: `/authors/${id}`,
      }),
      providesTags: ["Author"],
    }),

    updateAuthor: build.mutation<
      ApiResponse<IAuthor>,
      { id: string; body: AuthorFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/authors/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Author"],
    }),

    deleteAuthor: build.mutation<ApiResponse<IAuthor>, string>({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Author"],
    }),
  }),
})

export const {} = authorApi
