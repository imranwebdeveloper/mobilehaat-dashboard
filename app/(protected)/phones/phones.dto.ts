import z from "zod"
import {
  PhoneStatus,
  PhoneType,
  PhoneCategory,
  BDStatus,
  CameraType,
} from "./phones.constant"
import { slugify } from "@/lib/utils"

export const phoneSchema = (_isEdit?: boolean) => {
  const optionalNumber = z.union([z.number(), z.nan()]).optional()
  const keyValueSchema = z
    .object({
      name: z.string().min(1, "Label is required"),
      value: z.string().min(1, "Value is required"),
      value_type: z
        .enum(["text", "number", "boolean", "array"])
        .default("text"),
      group: z.string().optional(),
    })
    .transform((data) => ({
      ...data,
      key: slugify(data.name),
    }))

  const cameraSchema = z.object({
    type: z.nativeEnum(CameraType),
    mp: optionalNumber,
    aperture: z.string().optional(),
    sensor_size: z.string().optional(),
    pixel_size: z.string().optional(),
    focal_length: z.string().optional(),
    zoom: optionalNumber,
    features: z.array(z.string()).optional().default([]),
  })

  const cameraSystemSchema = z.object({
    cameras: z.array(cameraSchema).optional().default([]),
    features: z.array(z.string()).optional().default([]),
    videos: z.array(z.string()).optional().default([]),
    others: z.array(keyValueSchema).optional().default([]),
  })

  return z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    brand: z.string().min(1, "Brand is required"),
    slug: z.string().optional(),
    model: z.string().min(1, "Model is required"),
    announced: z.string().optional(),
    released: z.string().optional(),

    thumbnail: _isEdit
      ? z.string().optional()
      : z.string().min(1, "Thumbnail is required"),
    images: z.array(z.string()).optional().default([]),
    categories: z.array(z.string()).optional().default([]),
    phone_type: z
      .array(z.nativeEnum(PhoneType))
      .min(1, "At least one phone type is required")
      .default([PhoneType.SMARTPHONE]),
    types: z.array(z.nativeEnum(PhoneCategory)).optional().default([]),
    bd_status: z.nativeEnum(BDStatus).default(BDStatus.NA),
    approximate_price_bd: optionalNumber,
    expert_rating: optionalNumber,
    variants: z.array(
      z.object({
        ram: z.number().min(0),
        storage: z.number().min(0),
        official_price: optionalNumber,
        unofficial_price: optionalNumber,
        currency: z.string().default("BDT"),
      })
    ),
    os: z.object({
      name: z.string().optional(),
      custom_ui: z.string().optional(),
      others: z.array(keyValueSchema).optional().default([]),
    }),
    platform: z.object({
      chipset: z.string().optional(),
      gpu: z.string().optional(),
      cpu: z.string().optional(),
      fabrication: z.string().optional(),
      ram_type: z.string().optional(),
      others: z.array(keyValueSchema).optional().default([]),
    }),
    memory: z
      .object({
        card_slot: z.string().optional(),
        internal: z.string().optional(),
        storage_type: z.string().optional(),
        others: z.array(keyValueSchema).optional().default([]),
      })
      .optional(),
    display: z.object({
      type: z.string().min(1, "Display type is required"),
      size: z.string().min(1, "Display size is required"),
      resolution: z.string().min(1, "Display resolution is required"),
      protection: z.string().optional(),
      refresh_rate: optionalNumber,
      aspect_ratio: z.string().optional(),
      brightness: z.string().optional(),
      bezel: z.string().optional(),
      body_ratio: z.string().optional(),
      others: z.array(keyValueSchema).optional().default([]),
    }),
    front_camera: cameraSystemSchema,
    back_camera: cameraSystemSchema,
    battery: z.object({
      type: z.string().optional(),
      capacity: z.number().min(0, "Capacity must be positive"),
      others: z.array(keyValueSchema).optional().default([]),
    }),
    network: z
      .object({
        sim_slot: z.string().optional(),
        sim_type: z.string().optional(),
        technology: z.array(z.string()).optional().default([]),
        speed: z.string().optional(),
        others: z.array(keyValueSchema).optional().default([]),
      })
      .optional(),
    connectivity: z
      .object({
        wifi: z.string().optional(),
        bluetooth: z.string().optional(),
        positioning: z.string().optional(),
        usb: z.string().optional(),
        radio: z.boolean().optional().default(false),
        nfc: z.boolean().optional().default(false),
        others: z.array(keyValueSchema).optional().default([]),
      })
      .optional(),
    body: z
      .object({
        dimensions: z.string().optional(),
        weight_g: optionalNumber,
        build: z.string().optional(),
        colors: z.array(z.string()).optional().default([]),
        certifications: z.array(z.string()).optional().default([]),
        others: z.array(keyValueSchema).optional().default([]),
      })
      .optional(),
    sound: z
      .object({
        loudspeaker: z.boolean().optional().default(true),
        jack_3_5mm: z.boolean().optional().default(true),
        features: z.array(z.string()).optional().default([]),
        others: z.array(keyValueSchema).optional().default([]),
      })
      .optional(),
    features: z
      .object({
        fingerprint: z.string().optional(),
        sensors: z.array(z.string()).optional().default([]),
        special: z.array(z.string()).optional().default([]),
        others: z.array(keyValueSchema).optional().default([]),
      })
      .optional(),
    pros: z.array(z.string()).optional().default([]),
    cons: z.array(z.string()).optional().default([]),
    extras: z
      .array(
        z.object({
          group_key: z.string().min(1, "Group key is required"),
          label: z.string().min(1, "Label is required"),
          value: z.string().min(1, "Value is required"),
          order: z.number().default(0),
        })
      )
      .optional()
      .default([]),
    sources: z
      .array(
        z.object({
          label: z.string().min(1, "Label is required"),
          url: z.string().url("Must be a valid URL"),
        })
      )
      .optional()
      .default([]),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    status: z.nativeEnum(PhoneStatus).default(PhoneStatus.DRAFT),
    schema_version: z.number().default(1),
  })
}

export type PhoneFormValues = z.input<ReturnType<typeof phoneSchema>>
