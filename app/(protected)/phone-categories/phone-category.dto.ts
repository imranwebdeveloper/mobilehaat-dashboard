import z from "zod"
import { PhoneCategoryStatus } from "./phone-category.type"

export const phoneCategorySchema = () => {
  return z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    icon_name: z.string().optional(),
    thumbnail: z.string().optional().nullable(),
    status: z
      .nativeEnum(PhoneCategoryStatus)
      .default(PhoneCategoryStatus.ACTIVE),
    order: z.coerce.number().default(0),
    is_featured: z.boolean().default(false),
  })
}

export type PhoneCategoryFormValues = z.input<
  ReturnType<typeof phoneCategorySchema>
>
