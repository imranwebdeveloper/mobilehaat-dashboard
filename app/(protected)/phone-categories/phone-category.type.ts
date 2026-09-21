import { User } from "@/store/global.type"
import { IMedia } from "../media/media.type"

export enum PhoneCategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IPhoneCategory {
  _id: string
  name: string
  slug: string
  description?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  thumbnail?: IMedia | null
  icon_name?: string
  status: PhoneCategoryStatus
  order: number
  phone_count: number
  is_featured: boolean
  created_by: User
  updated_by?: User
  createdAt: string
  updatedAt: string
}
