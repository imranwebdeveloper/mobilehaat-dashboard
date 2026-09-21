import { configApi } from "@/config/reduxApiConfig"
import {
  ApiResponse,
  CommonQuery,
  CreateNotificationPayload,
  Notification,
} from "@/store/global.type"

interface NotificationListResponse extends ApiResponse<Notification[]> {
  paginate: {
    total: number
    has_next: boolean
    current_page: number
    total_pages: number
    per_page: number
    has_previous: boolean
    next_page: number | false
    previous_page: number | false
  }
}

interface UnreadCountResponse {
  status: boolean
  count: number
}

interface MarkReadResponse {
  status: boolean
  data: Notification
  message: string
}

interface NotificationQuery extends CommonQuery {
  is_read?: string
}

export const notificationApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationListResponse, NotificationQuery>({
      query: (params) => ({
        url: "/notifications",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Notification" as const,
                id: _id,
              })),
              "Notification",
            ]
          : ["Notification"],
    }),

    getUnreadCount: build.query<UnreadCountResponse, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),

    createNotification: build.mutation<
      ApiResponse<Notification>,
      CreateNotificationPayload
    >({
      query: (body) => ({
        url: "/notifications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

    markNotificationRead: build.mutation<MarkReadResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: build.mutation<
      ApiResponse<{ success: boolean }>,
      void
    >({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: build.mutation<
      ApiResponse<{ deleted: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi
