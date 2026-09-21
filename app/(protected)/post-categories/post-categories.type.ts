import { IMedia } from "../media/media.type"

export enum PostCategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IPostCategory {
  _id: string
  name: string
  slug: string
  description?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  thumbnail?: IMedia | null
  status: PostCategoryStatus
  order: number
  post_count: number
  is_featured: boolean
  created_by: {
    _id: string
    first_name: string
    last_name: string
  } | null
  updated_by?: {
    _id: string
    first_name: string
    last_name: string
  } | null
  createdAt: string
  updatedAt: string
}
