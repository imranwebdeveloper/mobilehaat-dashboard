import { User } from "@/store/global.type"

export enum SellerPlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum SellerPlanCurrency {
  BDT = "BDT",
}

export interface ISellerPlan {
  _id: string
  name: string
  slug: string
  description?: string
  features: string[]
  monthly_price: number
  is_paid: boolean
  currency: SellerPlanCurrency
  max_active_offers: number
  featured_listing: boolean
  priority_listing: boolean
  analytics: boolean
  verified_badge: boolean
  sort_order: number
  is_default: boolean
  status: SellerPlanStatus
  created_by?: User
  updated_by?: User
  createdAt: string
  updatedAt: string
}
