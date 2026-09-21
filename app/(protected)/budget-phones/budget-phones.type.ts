import { IPhone } from "../phones/phones.type"

export enum BudgetPhoneStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IBudgetPhone {
  _id?: string
  title: string
  slug: string
  description: string
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
    verdict?: string
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
