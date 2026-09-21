import { ApiResponse } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import {
  LogQuery,
  MonitoringLogsResponse,
  MonitoringOverview,
} from "./monitoring.type"

export const monitoringApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getMonitoringOverview: build.query<ApiResponse<MonitoringOverview>, null>({
      query: () => ({
        url: `/admin/monitoring/overview`,
      }),
    }),

    getMonitoringLogs: build.query<ApiResponse<MonitoringLogsResponse>, LogQuery>({
      query: (params) => ({
        url: `/admin/monitoring/logs`,
        params,
      }),
    }),
  }),
})

export const {
  useGetMonitoringOverviewQuery,
  useGetMonitoringLogsQuery,
} = monitoringApi
