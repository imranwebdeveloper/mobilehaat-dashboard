import { ApiResponse } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPhone, PhoneQuery } from "./phones.type"
import { PhoneFormValues } from "./phones.dto"

export interface GenerateMetadataBody {
  brand: string
  phone_model: string
  title?: string
  bd_status?: string
  official_price?: number
  unofficial_price?: number
  approximate_price_bd?: number
  battery_mah?: number
  main_camera_mp?: number
  display_size?: string
  chipset?: string
  ram_gb?: number
  is_5g?: boolean
  /** Every RAM/storage variant with its BD prices — the backend prefers this over the single-price fields. */
  variants?: Array<{
    ram_gb?: number
    storage_gb?: number
    official_price?: number
    unofficial_price?: number
  }>
  guidelines?: string
}

export interface GeneratedMetadata {
  meta_title: string
  meta_description: string
  meta_keywords: string
}

export const phoneApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createPhone: build.mutation<ApiResponse<IPhone>, PhoneFormValues>({
      query: (body) => ({
        url: `/phones`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Phone"],
    }),

    getAllPhone: build.query<ApiResponse<IPhone[]>, PhoneQuery>({
      query: (params) => ({
        url: `/phones`,
        params,
      }),
      providesTags: ["Phone"],
    }),

    getPhoneById: build.query<ApiResponse<IPhone>, string>({
      query: (id) => ({
        url: `/phones/${id}`,
      }),
      providesTags: ["Phone"],
    }),

    updatePhone: build.mutation<
      ApiResponse<IPhone>,
      { id: string; body: PhoneFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/phones/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Phone"],
    }),

    deletePhone: build.mutation<ApiResponse<IPhone>, string>({
      query: (id) => ({
        url: `/phones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Phone"],
    }),

    generatePhoneMetadata: build.mutation<
      ApiResponse<GeneratedMetadata>,
      GenerateMetadataBody
    >({
      query: (body) => ({
        url: `/ai/metadata`,
        method: "POST",
        body,
      }),
    }),

    /** Generate metadata from the saved phone (all variants) and save it to the phone. */
    generateAndApplyPhoneMetadata: build.mutation<
      ApiResponse<GeneratedMetadata>,
      { phoneId: string; guidelines?: string }
    >({
      query: ({ phoneId, guidelines }) => ({
        url: `/ai/metadata/${phoneId}?apply=true`,
        method: "POST",
        body: guidelines ? { guidelines } : {},
      }),
      invalidatesTags: ["Phone"],
    }),
  }),
})

export const {
  useCreatePhoneMutation,
  useGetAllPhoneQuery,
  useGetPhoneByIdQuery,
  useUpdatePhoneMutation,
  useDeletePhoneMutation,
  useGeneratePhoneMetadataMutation,
  useGenerateAndApplyPhoneMetadataMutation,
} = phoneApi
