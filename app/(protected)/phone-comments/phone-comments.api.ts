import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPhoneComment } from "./phone-comments.type"

export const phoneCommentApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPhoneComments: build.query<ApiResponse<IPhoneComment[]>, CommonQuery>(
      {
        query: (params) => ({
          url: `/phone-comments`,
          params,
        }),
        providesTags: ["PhoneComment"],
      }
    ),

    getPhoneCommentById: build.query<ApiResponse<IPhoneComment>, string>({
      query: (id) => ({
        url: `/phone-comments/${id}`,
      }),
      providesTags: ["PhoneComment"],
    }),

    moderatePhoneComment: build.mutation<
      ApiResponse<IPhoneComment>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/phone-comments/${id}/moderate`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PhoneComment"],
    }),

    deletePhoneComment: build.mutation<ApiResponse<IPhoneComment>, string>({
      query: (id) => ({
        url: `/phone-comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PhoneComment"],
    }),
  }),
})

export const {
  useGetAllPhoneCommentsQuery,
  useGetPhoneCommentByIdQuery,
  useModeratePhoneCommentMutation,
  useDeletePhoneCommentMutation,
} = phoneCommentApi
