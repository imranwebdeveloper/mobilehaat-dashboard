import { IUser } from "../users/users.type"

export interface IPhone {
  _id: string
  title: string
  slug: string
}

export interface IPhoneComment {
  _id: string
  phone: string
  phone_data?: IPhone
  user: IUser
  content: string
  rating?: number
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM" | "DELETED"
  parent_comment?: string
  likes: string[]
  dislikes: string[]
  createdAt: string
  updatedAt: string
}
