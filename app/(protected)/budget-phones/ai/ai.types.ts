export interface AiPreviewRanking {
  rank: number
  phone_id: string
}

export interface AiPreviewRequest {
  phone_ids: AiPreviewRanking[]
  transcript: string
}

export interface AiKeySpecs {
  display: string
  battery: string
  camera: string
  performance: string
  design: string
}

export interface AiPreviewRankingResponse {
  rank: number
  phone_id: string
  phone_name: string
  phone_model: string
  phone_brand: string
  slug: string
  key_specifications: AiKeySpecs
}

export interface AiPreviewResponse {
  original_transcript: string
  cleaned_transcript: string
  transcript: string // alias to cleaned_transcript for BC
  rankings: AiPreviewRankingResponse[]
}

export interface AiGenerateRequest {
  phone_ids: AiPreviewRanking[]
  transcript: string
  language?: string
  model?: string
}

export interface AiGenerateRanking {
  rank: number
  phone_id: string
  verdict: string
}

export interface AiGenerateFaq {
  question: string
  answer: string
}

export interface AiGenerateResponse {
  title: string
  slug: string
  description: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  min_price: number
  max_price: number
  quick_verdict?: string
  rankings: AiGenerateRanking[]
  faq: AiGenerateFaq[]
}

export interface BudgetPhoneFormDraft {
  title: string
  slug?: string
  description: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  min_price: number
  max_price: number
  rankings: Array<{
    rank: number
    phone_id: string
    verdict: string
    label?: string
  }>
  faq?: Array<{
    question: string
    answer: string
  }>
}

// ─── Transcript Clean (AI Service) ───────────────────────────────

export interface TranscriptCleanRequest {
  transcript: string
  model?: string
}

export interface TranscriptCleanResponse {
  cleaned_transcript: string
}
