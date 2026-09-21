import { ApiResponse } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { DashboardOverview } from "./dashboard.type"

export const dashboardApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardOverview: build.query<ApiResponse<DashboardOverview>, null>({
      query: () => ({
        url: "/dashboard/overview",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
})

export const { useGetDashboardOverviewQuery } = dashboardApi
