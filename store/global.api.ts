/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiResponse,
  CommonQuery,
  IRole,
  Permission,
  SiteSettings,
} from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"

export const globalApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllRole: build.query<ApiResponse<IRole[]>, CommonQuery>({
      query: (params) => ({
        url: `/roles`,
        params,
      }),
      providesTags: ["Role"],
    }),
    getAllPermission: build.query<ApiResponse<Permission[]>, CommonQuery>({
      query: (params) => ({
        url: `/permissions`,
        params,
      }),
      providesTags: ["Permission"],
    }),

    getData: build.query<ApiResponse<any[]>, CommonQuery & { url: string }>({
      query: ({ url, ...params }) => ({
        url,
        params,
      }),
    }),
    getWebSettings: build.query<ApiResponse<SiteSettings>, null>({
      query: () => ({
        url: `/web-settings/public`,
      }),
      providesTags: ["Setting"],
    }),
  }),
})

export const {} = globalApi
