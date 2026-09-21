import { IUser } from "../users/users.type"

export interface IPost {
  _id: string
  title: string
  slug: string
}

export interface IPostComment {
  _id: string
  post: string
  post_data?: IPost
  user: IUser
  content: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM" | "DELETED"
  parent_comment?: string
  likes: string[]
  dislikes: string[]
  createdAt: string
  updatedAt: string
}
