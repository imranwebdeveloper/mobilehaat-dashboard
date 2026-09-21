import { IMedia } from "../media/media.type"

export enum SellerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum SellerVerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum SellerBusinessType {
  INDIVIDUAL = "INDIVIDUAL",
  RETAILER = "RETAILER",
  WHOLESALER = "WHOLESALER",
  DISTRIBUTOR = "DISTRIBUTOR",
  ONLINE_STORE = "ONLINE_STORE",
  OTHER = "OTHER",
}

export interface ISellerAddress {
  address_line: string
  landmark?: string
  division_id: string
  district_id: string
  upazila_id?: string
  latitude?: number
  longitude?: number
}

export interface ISellerSocial {
  website?: string
  facebook?: string
  instagram?: string
  youtube?: string
  whatsapp?: string
}

export interface ISellerBranding {
  logo?: IMedia | null
  cover_image?: IMedia | null
}

export interface ISellerVerification {
  status: SellerVerificationStatus
  verified_at?: string
  verified_by?: string
  reason?: string
  attachments?: string[]
}

export interface ISeller {
  _id: string
  user_id: string
  store_name: string
  slug: string
  owner_name: string
  description?: string
  phone: string
  email: string
  alternate_phone?: string
  business_type?: SellerBusinessType
  address: ISellerAddress
  social: ISellerSocial
  branding: ISellerBranding
  status: SellerStatus
  verification: ISellerVerification
  settings?: {
    is_store_active: boolean
    show_phone: boolean
    show_email: boolean
    show_whatsapp: boolean
    show_address: boolean
    show_location: boolean
    show_website: boolean
    show_facebook: boolean
    show_instagram: boolean
    show_youtube: boolean
    show_out_of_stock: boolean
    email_notifications: boolean
    subscription_notifications: boolean
    offer_notifications: boolean
  }
  created_by?: string
  updated_by?: string
  createdAt: string
  updatedAt: string
}
