import z from "zod"
import { PostCategoryStatus } from "./post-categories.type"

export const postCategorySchema = (_isEdit?: boolean) => {
  void _isEdit
  return z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    thumbnail: z.string().optional().nullable(),
    order: z.coerce.number().default(0),
    is_featured: z.boolean().default(false),
    status: z.nativeEnum(PostCategoryStatus).default(PostCategoryStatus.ACTIVE),
  })
}

export type PostCategoryFormValues = z.input<
  ReturnType<typeof postCategorySchema>
>
