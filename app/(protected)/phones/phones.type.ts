import { CommonQuery } from "@/store/global.type"
import { IBrand } from "../brands/brands.type"
import { IMedia } from "../media/media.type"
import { IPhoneCategory } from "../phone-categories/phone-category.type"
import {
  PhoneStatus,
  PhoneType,
  PhoneCategory,
  BDStatus,
  CameraType,
} from "./phones.constant"

export interface IPhone {
  _id: string
  title: string
  brand: IBrand
  model: string
  categories?: IPhoneCategory[]
  announced?: string
  released?: string
  slug: string
  bd_status?: BDStatus
  expert_rating?: number
  approximate_price_bd?: number
  views?: number
  images: IMedia[]
  thumbnail: IMedia | null
  phone_type: PhoneType[]
  types?: PhoneCategory[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  status: PhoneStatus
  os: IPhoneOS
  platform: IPhonePlatform
  variants: IPhoneVariant[]
  memory?: IPhoneMemory
  display: IPhoneDisplay
  front_camera: IPhoneCameraSystem
  back_camera: IPhoneCameraSystem
  battery: IPhoneBattery
  network?: IPhoneNetwork
  connectivity?: IPhoneConnectivity
  body?: IPhoneBody
  sound?: IPhoneSound
  features?: IPhoneFeatures
  pros?: string[]
  cons?: string[]
  extras?: IPhoneExtra[]
  sources?: IPhoneSource[]
  schema_version: number
  created_by?: string
  updated_by?: string | null
  createdAt: string
  updatedAt: string
}

export interface IPhoneKeyValue {
  name: string
  value: string
  value_type?: "text" | "number" | "boolean" | "array"
  key: string
  group?: string
}

export interface IPhoneVariant {
  _id: string
  phone: string
  ram: number
  storage: number
  official_price?: number
  unofficial_price?: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface IPhoneOS {
  name: string
  custom_ui?: string
  others: IPhoneKeyValue[]
}

export interface IPhonePlatform {
  chipset?: string
  gpu?: string
  cpu?: string
  fabrication?: string
  ram_type?: string
  others: IPhoneKeyValue[]
}

export interface IPhoneMemory {
  card_slot?: string
  internal?: string
  storage_type?: string
  others: IPhoneKeyValue[]
}

export interface IPhoneDisplay {
  type: string
  size: string
  resolution: string
  protection?: string
  refresh_rate?: number
  aspect_ratio?: string
  brightness?: string
  bezel?: string
  body_ratio?: string
  others: IPhoneKeyValue[]
}

export interface IPhoneCamera {
  type: CameraType
  mp?: number
  aperture?: string
  sensor_size?: string
  pixel_size?: string
  focal_length?: string
  zoom?: number
  features: string[]
}

export interface IPhoneCameraSystem {
  cameras: IPhoneCamera[]
  features: string[]
  videos: string[]
  others: IPhoneKeyValue[]
}

export interface IPhoneBattery {
  type?: string
  capacity: number
  others: IPhoneKeyValue[]
}

export interface IPhoneNetwork {
  sim_slot?: string
  sim_type?: string
  technology: string[]
  speed?: string
  others: IPhoneKeyValue[]
}

export interface IPhoneConnectivity {
  wifi?: string
  bluetooth?: string
  positioning?: string
  usb?: string
  radio: boolean
  nfc: boolean
  others: IPhoneKeyValue[]
}

export interface IPhoneBody {
  dimensions?: string
  weight_g?: number
  build?: string
  colors: string[]
  certifications: string[]
  others: IPhoneKeyValue[]
}

export interface IPhoneSound {
  loudspeaker: boolean
  jack_3_5mm: boolean
  features: string[]
  others: IPhoneKeyValue[]
}

export interface IPhoneFeatures {
  fingerprint?: string
  sensors: string[]
  special: string[]
  others: IPhoneKeyValue[]
}

export interface IPhoneSource {
  label: string
  url: string
}

export interface IPhoneExtra {
  group_key: string
  label: string
  value: string
  order: number
}

export interface PhoneQuery extends CommonQuery {
  status?: PhoneStatus
  brand?: string
  phone_type?: PhoneType
  bd_status?: BDStatus
  min_ram?: number
  max_ram?: number
  min_storage?: number
  max_storage?: number
  min_price?: number
  max_price?: number
  min_battery_capacity_mah?: number
  has_nfc?: boolean
}
