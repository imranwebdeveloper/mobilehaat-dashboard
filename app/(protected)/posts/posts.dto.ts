import z from "zod"
import { PostStatus, PostType, PostUpdateStatus } from "./posts.type"

export const postSchema = (_isEdit?: boolean) => {
  void _isEdit
  return z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(10),
    excerpt: z.string().optional(),
    thumbnail: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    author: z.string().min(1, "Author is required"),
    status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
    type: z.nativeEnum(PostType).default(PostType.POST),
    tags: z.array(z.string()).default([]),
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(500).optional(),
    meta_keywords: z.string().max(200).optional(),
    is_featured: z.boolean().default(false),
    published_at: z.string().optional().or(z.literal("")),
    update_status: z.nativeEnum(PostUpdateStatus).default(PostUpdateStatus.CURRENT),
    last_reviewed_at: z.string().optional().or(z.literal("")),
    next_review_at: z.string().optional().or(z.literal("")),
    faqs: z
      .array(
        z.object({
          question: z.string().min(1, "Question is required"),
          answer: z.string().min(1, "Answer is required"),
        })
      )
      .optional(),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must only contain lowercase letters, numbers, and hyphens"
      ),
  })
}

export type PostFormValues = z.input<ReturnType<typeof postSchema>>
