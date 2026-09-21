import { z } from "zod"

export enum WebSettingsType {
  GENERAL = "GENERAL",
  SOCIAL = "SOCIAL",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  FOOTER = "FOOTER",
  HEADER = "HEADER",
  OTHER = "OTHER",
  SEO = "SEO",
  EMAIL = "EMAIL",
  SECURITY = "SECURITY",
  FEATURES = "FEATURES",
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface IWebSetting {
  _id?: string
  key: string
  value: JsonValue
  type: WebSettingsType
  description?: string
  group?: string
  createdAt?: string
  updatedAt?: string
}

export interface IUpsertSetting {
  key: string
  value: JsonValue
  type: WebSettingsType
  description?: string
}

// Zod Schema for Web Settings
export const WebSettingSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string(),
      value: z.any(),
      type: z.nativeEnum(WebSettingsType),
      description: z.string().optional(),
    })
  ),
})

export type WebSettingFormValues = z.infer<typeof WebSettingSchema>
