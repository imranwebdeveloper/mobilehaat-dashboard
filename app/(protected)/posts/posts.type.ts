import { IMedia } from "../media/media.type"
import { IPostCategory } from "../post-categories/post-categories.type"
import { IAuthor } from "../authors/authors.type"
import { User } from "@/store/global.type"

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  SCHEDULED = "SCHEDULED",
}

export enum PostType {
  POST = "POST",
  PAGE = "PAGE",
}

export interface IPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: IMedia
  category: IPostCategory
  author: IAuthor
  status: PostStatus
  type: PostType
  tags: string[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  is_featured?: boolean
  view_count: number
  published_at?: string
  created_by: User
  updated_by?: User
  createdAt: string
  updatedAt: string
}
