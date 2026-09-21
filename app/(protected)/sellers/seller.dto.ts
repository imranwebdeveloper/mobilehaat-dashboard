import z from "zod"
import {
  SellerStatus,
  SellerVerificationStatus,
  SellerBusinessType,
} from "./seller.type"

const geoRefId = z.string().min(1, "Required")

const coordString = z
  .string()
  .trim()
  .refine((v) => v === "" || Number.isFinite(Number(v)), "Invalid number")
  .optional()
  .default("")

export const sellerInfoSchema = (isEdit = false) =>
  z.object({
    store_name: z.string().min(1, "Store name is required").max(100),
    owner_name: z.string().min(1, "Owner name is required").max(100),
    description: z.string().optional().default(""),
    phone: z.string().min(1, "Phone is required").max(30),
    email: z.string().email("Valid email is required").max(120),
    alternate_phone: z.string().optional().default(""),
    business_type: z
      .nativeEnum(SellerBusinessType)
      .default(SellerBusinessType.INDIVIDUAL),
    user_id: isEdit
      ? z.string().optional()
      : z.string().min(1, "User is required"),
    status: z.nativeEnum(SellerStatus).default(SellerStatus.ACTIVE),
    verification_status: z
      .nativeEnum(SellerVerificationStatus)
      .default(SellerVerificationStatus.UNVERIFIED),
    address: z.object({
      address_line: z.string().min(1, "Address line is required").max(255),
      landmark: z.string().optional().default(""),
      division_id: geoRefId,
      district_id: geoRefId,
      upazila_id: z.string().optional().default(""),
      latitude: coordString,
      longitude: coordString,
    }),
    social: z.object({
      website: z.string().optional().default(""),
      facebook: z.string().optional().default(""),
      instagram: z.string().optional().default(""),
      youtube: z.string().optional().default(""),
      whatsapp: z.string().optional().default(""),
    }),
    branding: z.object({
      logo: z.string().optional().default(""),
      cover_image: z.string().optional().default(""),
    }),
    settings: z.object({
      is_store_active: z.boolean().default(true),
      show_phone: z.boolean().default(true),
      show_email: z.boolean().default(false),
      show_whatsapp: z.boolean().default(true),
      show_address: z.boolean().default(true),
      show_location: z.boolean().default(true),
      show_website: z.boolean().default(true),
      show_facebook: z.boolean().default(true),
      show_instagram: z.boolean().default(true),
      show_youtube: z.boolean().default(true),
      show_out_of_stock: z.boolean().default(true),
      email_notifications: z.boolean().default(true),
      subscription_notifications: z.boolean().default(true),
      offer_notifications: z.boolean().default(true),
    }),
  })

export const sellerStatusSchema = () =>
  z.object({
    status: z.nativeEnum(SellerStatus),
  })

export const sellerVerificationSchema = () =>
  z.object({
    status: z.nativeEnum(SellerVerificationStatus),
    reason: z.string().optional().default(""),
  })

export type SellerInfoFormValues = z.input<ReturnType<typeof sellerInfoSchema>>

export type SellerSubmitValues = Omit<SellerInfoFormValues, "address"> & {
  address: Omit<SellerInfoFormValues["address"], "latitude" | "longitude"> & {
    latitude?: number
    longitude?: number
  }
}

export type UpdateSellerFormValues = Omit<
  SellerInfoFormValues,
  "user_id" | "status" | "verification_status"
>
export type SellerStatusFormValues = z.input<
  ReturnType<typeof sellerStatusSchema>
>
export type SellerVerificationFormValues = z.input<
  ReturnType<typeof sellerVerificationSchema>
>
