import { ApiResponse } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import {
  AiPreviewRequest,
  AiPreviewResponse,
  AiGenerateRequest,
  AiGenerateResponse,
  TranscriptCleanRequest,
  TranscriptCleanResponse,
} from "./ai.types"

export const budgetPhoneAiApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    aiPreview: build.mutation<ApiResponse<AiPreviewResponse>, AiPreviewRequest>(
      {
        query: (body) => ({
          url: `/budget-phones/ai/preview`,
          method: "POST",
          body,
        }),
      }
    ),

    aiGenerate: build.mutation<
      ApiResponse<AiGenerateResponse>,
      AiGenerateRequest
    >({
      query: (body) => ({
        url: `/budget-phones/ai/generate`,
        method: "POST",
        body,
      }),
    }),

    // ─── Transcript Clean (AI Service) ──────────────────────────

    cleanTranscript: build.mutation<
      ApiResponse<TranscriptCleanResponse>,
      TranscriptCleanRequest
    >({
      query: (body) => ({
        url: `/ai/transcript/clean`,
        method: "POST",
        body,
      }),
    }),

    regenerateTranscript: build.mutation<
      ApiResponse<TranscriptCleanResponse>,
      TranscriptCleanRequest
    >({
      query: (body) => ({
        url: `/ai/transcript/regenerate`,
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useAiPreviewMutation,
  useAiGenerateMutation,
  useCleanTranscriptMutation,
  useRegenerateTranscriptMutation,
} = budgetPhoneAiApi
