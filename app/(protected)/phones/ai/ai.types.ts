export type AiExtractionStatus =
  | "pending"
  | "fetching"
  | "extracted"
  | "generating"
  | "completed"
  | "failed"

export interface AiStageError {
  stage: string
  message: string
}

export interface AiKeyValue {
  name: string
  value: string
  value_type?: "text" | "number" | "boolean" | "array"
  key: string
  group?: string
}

export interface AiVariant {
  ram: number
  storage: number
  official_price?: number
  unofficial_price?: number
  currency?: "BDT" | "USD"
}

export interface AiCamera {
  type: string
  mp?: number
  aperture?: string
  sensor_size?: string
  pixel_size?: string
  focal_length?: string
  zoom?: number
  features: string[]
}

export interface AiCameraSystem {
  cameras: AiCamera[]
  features: string[]
  videos: string[]
  others: AiKeyValue[]
}

export interface AiStructure {
  title: string
  brand: string
  model: string
  slug?: string
  announced?: string | null
  released?: string | null
  bd_status?: string | null
  expert_rating?: number | null
  approximate_price_bd?: number | null
  phone_type?: string[]
  os?: {
    name?: string | null
    custom_ui?: string | null
    others?: AiKeyValue[]
  } | null
  platform?: {
    chipset?: string | null
    gpu?: string | null
    cpu?: string | null
    fabrication?: string | null
    ram_type?: string | null
    others?: AiKeyValue[]
  } | null
  memory?: {
    card_slot?: string | null
    internal?: string | null
    storage_type?: string | null
    others?: AiKeyValue[]
  } | null
  display?: {
    type?: string | null
    size?: string | null
    resolution?: string | null
    protection?: string | null
    refresh_rate?: number | null
    aspect_ratio?: string | null
    brightness?: string | null
    bezel?: string | null
    body_ratio?: string | null
    others?: AiKeyValue[]
  } | null
  front_camera?: AiCameraSystem | null
  back_camera?: AiCameraSystem | null
  battery?: {
    type?: string | null
    capacity?: number | null
    others?: AiKeyValue[]
  } | null
  network?: {
    sim_slot?: string | null
    sim_type?: string | null
    technology?: string[]
    speed?: string | null
    others?: AiKeyValue[]
  } | null
  connectivity?: {
    wifi?: string | null
    bluetooth?: string | null
    positioning?: string | null
    usb?: string | null
    radio?: boolean | null
    nfc?: boolean | null
    others?: AiKeyValue[]
  } | null
  body?: {
    dimensions?: string | null
    weight_g?: number | null
    build?: string | null
    colors?: string[]
    certifications?: string[]
    others?: AiKeyValue[]
  } | null
  sound?: {
    loudspeaker?: boolean | null
    jack_3_5mm?: boolean | null
    features?: string[]
    others?: AiKeyValue[]
  } | null
  features?: {
    fingerprint?: string | null
    sensors?: string[]
    special?: string[]
    others?: AiKeyValue[]
  } | null
  variants: AiVariant[]
  sources: Array<{ label: string; url: string }>
}

export interface AiEditorial {
  meta_title: string
  meta_description: string
  meta_keywords: string
  pros: string[]
  cons: string[]
  types?: string[]
}

export interface MobileExtraction {
  _id: string
  url: string
  normalizedUrl: string
  status: AiExtractionStatus
  lastError?: AiStageError | null
  source?: { label: string; url: string } | null
  rawText?: string
  structuredData?: AiStructure | null
  generatedAt?: string
  generationVersion?: number
  editorialData?: AiEditorial | null
  editorialGeneratedAt?: string
  editorialVersion?: number
  approved?: boolean
  approvedPhone?: string
  fetchedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AiExtractionQuery {
  status?: AiExtractionStatus
  limit?: number
  offset?: number
}

export interface ApproveExtractionBody {
  images?: string[]
  thumbnail?: string
  categories?: string[]
}

export interface ScraperApiResponse<T> {
  data: T
}

import type { PhoneFormValues } from "../phones.dto"
import type { SelectOption } from "@/components/common/select/AsyncSelect"

export interface PhoneFormDraft {
  values: PhoneFormValues
  brand?: SelectOption | null
}
