export enum PaymentStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum PaymentMethod {
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  BANK_TRANSFER = "BANK_TRANSFER",
  OTHER = "OTHER",
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
}

export interface ISubscriptionReference {
  _id: string
  plan_name: string
  plan_id: ISellerPlanReference
  status: string
  price: number
  start_at?: string
  end_at?: string
}

export interface IPaymentRecord {
  _id: string
  seller_id: ISellerReference
  subscription_id: ISubscriptionReference
  payment_method: PaymentMethod
  amount: number
  currency: string
  transaction_reference?: string | null
  status: PaymentStatus
  rejection_reason?: string | null
  submitted_at?: string | null
  verified_at?: string | null
  createdAt: string
  updatedAt: string
}
