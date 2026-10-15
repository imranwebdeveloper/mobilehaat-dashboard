import { IPagination } from "@/store/global.type"

export type PriceStage =
  | "LAUNCH"
  | "FRESH"
  | "STABLE"
  | "MATURE"
  | "OLD"
  | "UPCOMING"
  | "SKIP"

export type PriceBadge = "OVERDUE" | "DUE_SOON" | "FRESH" | "INACTIVE"

export type PriceTrack = "PRICE" | "UPCOMING" | "FROZEN"

export type ExpectedPriceConfidence = "RUMOUR" | "GLOBAL_LAUNCH" | "BD_TEASER"

export interface ExpectedPrice {
  price: number
  basis?: string
  confidence: ExpectedPriceConfidence
  launch_bd?: string
  updated_at: string
}

export interface SaveExpectedPriceBody {
  price: number
  basis?: string
  confidence: ExpectedPriceConfidence
  launch_bd?: string
}

export interface CalculateExpectedBody {
  amount: number
  currency: string
  rate?: number
  factor?: number
  phoneId?: string
}

export interface ExpectedCalculation {
  currency: string
  amount: number
  rate: number
  factor: number
  converted: number
  raw: number
  rounded: number
}

export interface ExpectedDefaults {
  exchangeRatesToBdt: Record<string, number>
  defaultBrandFactor: number
  brandFactors: Record<string, number>
}

export type PriceCheckAction =
  | "UPDATED"
  | "SAVED_UNCHANGED"
  | "CONFIRMED"
  | "NOT_FOUND"

export interface PhonePriority {
  id: string
  title: string
  slug: string
  brand: { id: string; name: string } | null
  status: string
  bd_status: string | null
  released: string | null
  views: number
  approximate_price_bd: number | null
  checkedAt: string
  checkedAtSource: "PRICE_WATCH" | "PRICE_HISTORY" | "PHONE_CREATED"
  lastAction: PriceCheckAction | null
  changedAt: string | null
  missCount: number
  suggestDiscontinued: boolean
  expected: ExpectedPrice | null
  launchOverdue: boolean
  stage: PriceStage
  track: PriceTrack
  needsData: boolean
  ageDays: number | null
  intervalDays: number | null
  weight: number
  daysSinceCheck: number
  dueAt: string | null
  overdue: number
  trafficBoost: number
  priority: number
  badge: PriceBadge
  noPrice: boolean
}

export interface PrioritySummary {
  generated_at: string
  total_phones: number
  by_track: Partial<Record<PriceTrack, number>>
  by_stage: Partial<Record<PriceStage, number>>
  price_track: {
    total: number
    due_now: number
    due_soon: number
    no_price: number
    due_by_stage: Partial<Record<PriceStage, number>>
    due_by_brand: Record<string, number>
    freshness_score: number
  }
  upcoming_due: number
  upcoming_track: {
    total: number
    due_now: number
    launch_overdue: number
    no_estimate: number
    not_documented: number
    by_confidence: Partial<Record<ExpectedPriceConfidence | "NONE", number>>
  }
  needs_data: number
  brands: { id: string; name: string; total: number; due: number }[]
}

export interface PriorityResponse {
  data: PhonePriority[]
  summary: PrioritySummary
  paginate: IPagination
  status: boolean
  message: string
}

export interface PriorityQuery {
  track?: PriceTrack | "ALL"
  stage?: PriceStage
  badge?: PriceBadge
  brand?: string
  dueOnly?: boolean
  needsData?: boolean
  page?: number
  limit?: number
}
