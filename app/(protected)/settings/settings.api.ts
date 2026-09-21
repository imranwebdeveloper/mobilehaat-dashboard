import { ApiResponse } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IWebSetting, WebSettingsType } from "./settings.type"

export const settingsApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<
      ApiResponse<IWebSetting[]>,
      WebSettingsType | void
    >({
      query: (type) => ({
        url: `/web-settings`,
        params: type ? { type } : {},
      }),
      providesTags: ["Setting"],
    }),

    bulkUpdateSettings: build.mutation<
      ApiResponse<IWebSetting[]>,
      { settings: Partial<IWebSetting>[] }
    >({
      query: (body) => ({
        url: `/web-settings/bulk`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Setting"],
    }),

    updateSetting: build.mutation<
      ApiResponse<IWebSetting>,
      Partial<IWebSetting>
    >({
      query: (body) => ({
        url: `/web-settings`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Setting"],
    }),
  }),
})

export const {
  useGetSettingsQuery,
  useBulkUpdateSettingsMutation,
  useUpdateSettingMutation,
} = settingsApi
