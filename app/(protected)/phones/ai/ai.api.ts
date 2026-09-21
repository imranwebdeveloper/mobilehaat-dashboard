import { scraperApi } from "@/config/scraperApiConfig"
import {
  MobileExtraction,
  AiExtractionQuery,
  ApproveExtractionBody,
} from "./ai.types"

export interface ApproveExtractionResult {
  extraction: MobileExtraction
  phone: unknown
}

export const aiApi = scraperApi.injectEndpoints({
  endpoints: (build) => ({
    createExtraction: build.mutation<MobileExtraction, { url: string }>({
      query: (body) => ({
        url: `/mobile-extractions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MobileExtraction"],
    }),

    getAllExtractions: build.query<MobileExtraction[], AiExtractionQuery>({
      query: (params) => ({
        url: `/mobile-extractions`,
        params,
      }),
      providesTags: ["MobileExtraction"],
    }),

    getExtractionById: build.query<MobileExtraction, string>({
      query: (id) => ({
        url: `/mobile-extractions/${id}`,
      }),
      providesTags: ["MobileExtraction"],
    }),

    deleteExtraction: build.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/mobile-extractions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MobileExtraction"],
    }),

    regenerateExtraction: build.mutation<
      MobileExtraction,
      { id: string; model?: string }
    >({
      query: ({ id, model }) => ({
        url: `/mobile-extractions/${id}/regenerate`,
        method: "POST",
        body: model ? { model } : undefined,
      }),
      invalidatesTags: ["MobileExtraction"],
    }),

    generateExtractionEditorial: build.mutation<
      MobileExtraction,
      { id: string; model?: string }
    >({
      query: ({ id, model }) => ({
        url: `/mobile-extractions/${id}/generate-editorial`,
        method: "POST",
        body: model ? { model } : undefined,
      }),
      invalidatesTags: ["MobileExtraction"],
    }),

    approveExtraction: build.mutation<
      ApproveExtractionResult,
      { id: string; body?: ApproveExtractionBody }
    >({
      query: ({ id, body }) => ({
        url: `/mobile-extractions/${id}/approve`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: ["MobileExtraction"],
    }),
  }),
})

export const {
  useCreateExtractionMutation,
  useGetAllExtractionsQuery,
  useGetExtractionByIdQuery,
  useLazyGetExtractionByIdQuery,
  useRegenerateExtractionMutation,
  useGenerateExtractionEditorialMutation,
  useApproveExtractionMutation,
  useDeleteExtractionMutation,
} = aiApi
