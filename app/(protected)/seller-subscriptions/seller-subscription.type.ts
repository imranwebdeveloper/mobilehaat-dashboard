export enum SubscriptionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  SUSPENDED = "SUSPENDED",
}

export enum SubscriptionSource {
  DEFAULT = "DEFAULT",
  UPGRADE = "UPGRADE",
  ADMIN = "ADMIN",
}

export enum SubscriptionPeriod {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  HALF_YEARLY = "HALF_YEARLY",
  YEARLY = "YEARLY",
  CUSTOM = "CUSTOM",
}

export interface ISellerReference {
  _id: string
  store_name: string
  status?: string
}

export interface ISellerPlanReference {
  _id: string
  name: string
  slug?: string
  monthly_price: number
  is_default?: boolean
  status?: string
}

export interface IPreviousSubscriptionReference {
  _id: string
  plan_name: string
  status: string
  start_at?: string
  end_at?: string
  price: number
}

export interface ISellerSubscription {
  _id: string
  seller_id: ISellerReference
  plan_id: ISellerPlanReference
  status: SubscriptionStatus
  price: number
  currency: string
  plan_name: string
  max_active_offers: number
  period: SubscriptionPeriod
  duration_months: number
  start_at: string
  end_at: string | null
  source: SubscriptionSource
  previous_subscription_id?: IPreviousSubscriptionReference | null
  cancel_at_period_end?: boolean
  cancelled_at?: string | null
  cancel_reason?: string | null
  renewal_count?: number
  createdAt: string
  updatedAt: string
}
