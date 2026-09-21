import { IMedia } from "../media/media.type"

export enum AuthorStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IAuthor {
  _id: string
  name: string
  slug: string
  bio?: string
  avatar?: IMedia | null
  designation?: string
  social_links?: {
    twitter?: string
    linkedin?: string
    website?: string
    facebook?: string
  }
  status: AuthorStatus
  post_count: number
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
