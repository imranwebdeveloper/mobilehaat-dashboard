import { IPhone } from "../phones/phones.type"
import { IAuthor } from "../authors/authors.type"

export enum BestPhoneStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// #1–5 get a full card (paragraph + pros/cons), #6–10 a short one.
export enum BestPhoneTier {
  FULL = "FULL",
  SHORT = "SHORT",
}

export enum BestPhoneBadge {
  VALUE = "VALUE",
  PERFORMANCE = "PERFORMANCE",
  CAMERA = "CAMERA",
  BATTERY = "BATTERY",
  DISPLAY = "DISPLAY",
  OFFICIAL = "OFFICIAL",
}

export const BEST_PHONE_BADGE_LABELS: Record<BestPhoneBadge, string> = {
  [BestPhoneBadge.VALUE]: "Value",
  [BestPhoneBadge.PERFORMANCE]: "Performance",
  [BestPhoneBadge.CAMERA]: "Camera",
  [BestPhoneBadge.BATTERY]: "Battery",
  [BestPhoneBadge.DISPLAY]: "Display",
  [BestPhoneBadge.OFFICIAL]: "Official",
}

export enum BestPhoneChangeType {
  NEW = "NEW",
  OUT = "OUT",
  MOVED = "MOVED",
}

export interface IBestPhoneRanking {
  rank: number
  phone: IPhone
  tier: BestPhoneTier
  badges: BestPhoneBadge[]
  chips: string[]
  for_whom: string
  pros: string[]
  cons: string[]
  content?: string
  editor_note?: string
}

export interface IBestPhoneChange {
  month: string
  items: Array<{
    type: BestPhoneChangeType
    phone?: Pick<IPhone, "_id" | "title" | "slug"> | null
    text: string
  }>
}

export interface IBestPhone {
  _id?: string
  title: string
  slug: string
  intro: string
  disclaimer?: string
  author: string | IAuthor
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  thumbnail?: string | Record<string, unknown>
  min_price: number
  max_price: number
  tolerance_pct?: number
  last_reviewed_at?: string | null
  views_count?: number
  status: BestPhoneStatus
  rankings?: IBestPhoneRanking[]
  changes?: IBestPhoneChange[]
  faq?: Array<{
    question: string
    answer: string
  }>
  created_by?: string
  updated_by?: string | null
  createdAt?: string
  updatedAt?: string
}
