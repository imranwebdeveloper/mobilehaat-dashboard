import { Permission } from "@/store/global.type"
import { IMedia } from "../media/media.type"

export interface IUser {
  _id: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone_number?: string
  address?: string
  country?: string
  gender?: string
  roles: {
    _id: string
    name: string
  }[]

  is_active: boolean
  is_verified: boolean
  last_login?: string
  avatar?: IMedia
  createdAt: string
  updatedAt: string
  permissions: Permission[]
  two_factor_enabled?: boolean
}
