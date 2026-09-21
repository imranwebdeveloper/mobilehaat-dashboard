import { IPhone } from "../phones/phones.type"
import { IMedia } from "../media/media.type"

export enum ComparisonStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface ComparisonScores {
  display: { phone_a: number; phone_b: number }
  performance: { phone_a: number; phone_b: number }
  camera: { phone_a: number; phone_b: number }
  battery: { phone_a: number; phone_b: number }
  design: { phone_a: number; phone_b: number }
  value: { phone_a: number; phone_b: number }
  overall: { phone_a: number; phone_b: number }
  best_value: { phone_a: number; phone_b: number }
}

export interface ComparisonBestFor {
  phone_a: string
  phone_b: string
}

export interface ComparisonFaq {
  question: string
  answer: string
}

export interface IComparison {
  _id?: string
  title: string
  slug: string
  phones: IPhone[]
  thumbnail?: IMedia
  intro?: string
  verdict?: string
  best_for?: ComparisonBestFor
  faqs?: ComparisonFaq[]
  scores?: ComparisonScores
  meta_title?: string
  meta_description?: string
  analysisId?: string
  status: ComparisonStatus
  created_by?: string
  updated_by?: string
  createdAt?: string
  updatedAt?: string
}

export interface IComparisonAnalytics {
  _id: string
  phoneA: IPhone | null
  phoneB: IPhone | null
  comparisonKey: string
  totalComparisons: number
  lastComparedAt: string | null
  createdAt: string
}
