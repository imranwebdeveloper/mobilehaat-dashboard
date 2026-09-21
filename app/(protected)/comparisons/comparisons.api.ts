import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import {
  IComparison,
  IComparisonAnalytics,
  ComparisonScores,
  ComparisonBestFor,
  ComparisonFaq,
} from "./comparisons.type"
import { ComparisonFormValues } from "./comparisons.dto"

export interface AiComparisonData {
  title: string
  slug: string
  intro: string
  verdict: string
  best_for: ComparisonBestFor
  faqs: ComparisonFaq[]
  meta_title: string
  meta_description: string
  scores: ComparisonScores
  analysisId: string
}

export const comparisonsApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    createComparison: build.mutation<
      ApiResponse<IComparison>,
      ComparisonFormValues
    >({
      query: (body) => ({
        url: `/comparisons`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comparison"],
    }),

    getAllComparisons: build.query<ApiResponse<IComparison[]>, CommonQuery>({
      query: (params) => ({
        url: `/comparisons`,
        params,
      }),
      providesTags: ["Comparison"],
    }),

    getComparisonById: build.query<ApiResponse<IComparison>, string>({
      query: (id) => ({
        url: `/comparisons/${id}`,
      }),
      providesTags: ["Comparison"],
    }),

    updateComparison: build.mutation<
      ApiResponse<IComparison>,
      { id: string; body: ComparisonFormValues }
    >({
      query: ({ id, body }) => ({
        url: `/comparisons/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Comparison"],
    }),

    deleteComparison: build.mutation<ApiResponse<IComparison>, string>({
      query: (id) => ({
        url: `/comparisons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comparison"],
    }),

    generateComparisonAi: build.mutation<
      ApiResponse<AiComparisonData>,
      { phone_ids: string[]; guidelines?: string; model?: string }
    >({
      query: (body) => ({
        url: `/ai/comparison`,
        method: "POST",
        body,
      }),
    }),

    getPopularComparisons: build.query<
      ApiResponse<IComparisonAnalytics[]>,
      CommonQuery
    >({
      query: (params) => ({
        url: `/comparisons/popular`,
        params,
      }),
      providesTags: ["Comparison"],
    }),
  }),
})

export const {
  useCreateComparisonMutation,
  useGetAllComparisonsQuery,
  useGetComparisonByIdQuery,
  useLazyGetComparisonByIdQuery,
  useUpdateComparisonMutation,
  useDeleteComparisonMutation,
  useGenerateComparisonAiMutation,
  useGetPopularComparisonsQuery,
} = comparisonsApi
