import { User } from "@/store/global.type"
import { IMedia } from "../media/media.type"

export enum BrandStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IBrand {
  _id?: string
  name: string
  slug: string
  logo?: IMedia | string
  thumbnail?: IMedia | string
  description?: string
  about?: string
  meta_description?: string
  meta_title?: string
  meta_keywords?: string
  official_site_links?: string
  status: BrandStatus
  is_featured?: boolean
  phone_count: number
  order: number
  created_by: User
  updated_by?: User
  createdAt?: string
  updatedAt?: string
}
