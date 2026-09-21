import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IUser } from "./users.type"
import { UserFormValues } from "./users.dto"

export const userApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createUser: build.mutation<ApiResponse<IUser>, UserFormValues>({
      query: (body) => ({
        url: `/users`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    getAllUser: build.query<ApiResponse<IUser[]>, CommonQuery>({
      query: (params) => ({
        url: `/users`,
        params,
      }),
      providesTags: ["User"],
    }),

    getUserById: build.query<ApiResponse<IUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
      }),
      providesTags: ["User"],
    }),

    updateUser: build.mutation<
      ApiResponse<IUser>,
      { id: string; body: UserFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: build.mutation<ApiResponse<IUser>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    bulkDeleteUser: build.mutation<ApiResponse<IUser>, { ids: string[] }>({
      query: (body) => ({
        url: `/users/bulk-delete`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    getPermissionsByUserId: build.query<ApiResponse<IUser>, string>({
      query: (id) => ({
        url: `/users/permissions/${id}`,
      }),
      providesTags: ["User"],
    }),

    assignUserPermission: build.mutation<
      ApiResponse<IUser>,
      {
        user_id: string
        permission_id: string
      }
    >({
      query: (body) => ({
        url: `/users/permissions/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    unAssignUserPermission: build.mutation<
      ApiResponse<IUser>,
      {
        user_id: string
        permission_id: string
      }
    >({
      query: (body) => ({
        url: `/users/permissions/unassign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
})

export const {
  useCreateUserMutation,
  useGetAllUserQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkDeleteUserMutation,
  useGetPermissionsByUserIdQuery,
  useAssignUserPermissionMutation,
  useUnAssignUserPermissionMutation,
} = userApi
