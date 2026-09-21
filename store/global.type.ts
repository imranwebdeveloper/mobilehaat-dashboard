import { IUser } from "@/app/(protected)/users/users.type"

export type User = IUser

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T> {
  message: string
  data: T
  status: boolean
  paginate?: IPagination
}

export interface IPagination {
  total: number
  has_next: boolean
  current_page: number
  total_pages: number
  per_page: number
  has_previous: boolean
  next_page: number | false
  previous_page: number | false
}
export interface CommonQuery {
  limit?: number
  page?: number
  sortBy?: string
  search?: string
  searchFields?: string
  [key: string]: any
}

export interface Permission {
  _id: string
  resource: string
  action: string
  scope: string
  description: string
  is_system: boolean
  createdAt: string
  updatedAt: string
  name: string
  __v: number
  id: string
}

export interface IRole {
  _id?: string
  name: string
  description?: string
  is_system: boolean
  created_by?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthUser {
  id: string
  access_token: string
  refresh_token?: string
  user: IUser
}

export interface SiteSettingsResponse {
  data: SiteSettings
  status: boolean
  message: string
}

export interface SiteSettings {
  domain: string
  site_name: string
  site_tagline: string
  site_logo: string
  site_logo_dark: string
  favicon: string

  contact_email: string
  support_email: string
  contact_phone: string
  address: string

  timezone: string
  date_format: string
  currency: string

  social_links: SocialLinks

  announcement_bar: AnnouncementBarItem[]

  popup_announcement: PopupAnnouncement

  footer_text: string
  footer_columns: FooterColumns

  meta_title: string
  meta_description: string
  meta_keywords: string[]

  email_config: EmailConfig

  maintenance_mode: boolean
}

export interface SocialLinks {
  facebook: string
  twitter: string
  instagram: string
  youtube: string
  linkedin: string
  github: string
  discord: string
  telegram: string
  whatsapp: string
  tiktok: string
}

export interface AnnouncementBarItem {
  text: string
  enabled: boolean
  link: string
  link_text: string
}

export interface PopupAnnouncement {
  title: string
  message: string
  enabled: boolean
  image: string
  button_text: string
  button_link: string
  show_after_days: number
}

export interface FooterColumns {
  about: FooterAbout
  quick_links: FooterLinks
  support: FooterLinks
}

export interface FooterAbout {
  title: string
  content: string
}

export interface FooterLinks {
  title: string
  links: FooterLinkItem[]
}

export interface FooterLinkItem {
  text: string
  url: string
}

export interface EmailConfig {
  from_email: string
  from_name: string
  reply_to: string
  welcome_email_template: string
  newsletter_template: string
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export enum NotificationTarget {
  ALL = "all",
  USERS = "users",
  ROLES = "roles",
}

export interface Notification {
  _id: string
  title: string
  message: string
  type: NotificationType
  target: NotificationTarget
  target_users: string[]
  target_roles: string[]
  created_by: string
  created_by_user?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
  read_by: string[]
  is_read: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationPayload {
  title: string
  message: string
  type?: NotificationType
  target?: NotificationTarget
  target_users?: string[]
  target_roles?: string[]
}
