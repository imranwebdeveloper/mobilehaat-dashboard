export type UserMediaPurpose =
  | "PROFILE"
  | "SELLER_LOGO"
  | "SELLER_COVER"
  | "SELLER_BANNER"
  | "SELLER_ATTACHMENT"
  | "GENERAL"

export interface IUserMedia {
  _id: string
  user_id: string | { _id: string; email?: string; first_name?: string }
  name: string
  purpose: UserMediaPurpose
  mime_type: string
  size: number
  path: string
  url: string
  alt?: string
  width?: number
  height?: number
  createdAt: string
  updatedAt: string
}

export const USER_MEDIA_PURPOSE_OPTIONS: { label: string; value: UserMediaPurpose }[] = [
  { label: "General", value: "GENERAL" },
  { label: "Profile", value: "PROFILE" },
  { label: "Seller Logo", value: "SELLER_LOGO" },
  { label: "Seller Cover", value: "SELLER_COVER" },
  { label: "Seller Banner", value: "SELLER_BANNER" },
  { label: "Seller Attachment", value: "SELLER_ATTACHMENT" },
]
