import { User } from "@/store/global.type"
export enum VideoMimeType {
  MP4 = "video/mp4",
  WEBM = "video/webm",
}

export enum MIME_TYPES {
  JPG = "image/jpeg",
  PNG = "image/png",
  WEBP = "image/webp",
}
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface IMedia {
  _id: string

  name: string
  url: string

  create_by: User

  resource_type: MediaType

  size: number
  source_id: string

  alt?: string

  width: number
  height: number
  mime_type: string

  createdAt: string
  updatedAt: string
}
