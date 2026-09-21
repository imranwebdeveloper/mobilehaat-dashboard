export enum SellerOfferStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  EXPIRED = "EXPIRED",
}

export interface ISellerOfferSeller {
  _id: string
  store_name: string
  slug: string
  status: string
}

export interface ISellerOfferPhone {
  _id: string
  title: string
  slug: string
  brand?: string
}

export interface ISellerOfferVariant {
  _id: string
  ram: number
  storage: number
  official_price?: number
  unofficial_price?: number
}

export interface ISellerOffer {
  _id: string
  seller_id: ISellerOfferSeller
  phone_id: ISellerOfferPhone
  variant_id: ISellerOfferVariant
  price: number
  currency: string
  stock: number
  status: SellerOfferStatus
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}
