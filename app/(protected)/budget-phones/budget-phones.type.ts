import { IPhone } from "../phones/phones.type"
import { IAuthor } from "../authors/authors.type"

export enum BudgetPhoneStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum BudgetPhoneBestFor {
  OVERALL = "OVERALL",
  CAMERA = "CAMERA",
  GAMING = "GAMING",
  BATTERY = "BATTERY",
}

export const BUDGET_PHONE_BEST_FOR_LABELS: Record<BudgetPhoneBestFor, string> =
  {
    [BudgetPhoneBestFor.OVERALL]: "Overall",
    [BudgetPhoneBestFor.CAMERA]: "Camera",
    [BudgetPhoneBestFor.GAMING]: "Gaming",
    [BudgetPhoneBestFor.BATTERY]: "Battery",
  }

export interface IBudgetPhone {
  _id?: string
  title: string
  slug: string
  intro: string
  disclaimer?: string
  key_differences?: string
  author: string | IAuthor
  best_for?: BudgetPhoneBestFor[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  thumbnail?: string | Record<string, unknown>
  min_price: number
  max_price: number
  views_count?: number
  status: BudgetPhoneStatus
  rankings?: Array<{
    rank: number
    phone: IPhone
    content: string
  }>
  faq?: Array<{
    question: string
    answer: string
  }>
  created_by?: string
  updated_by?: string | null
  createdAt?: string
  updatedAt?: string
}
