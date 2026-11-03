import z from "zod"
import {
  BestPhoneBadge,
  BestPhoneChangeType,
  BestPhoneStatus,
  BestPhoneTier,
} from "./best-phones.type"

// Lines typed in a textarea, one item per line; blanks are dropped on save.
const lines = z.array(z.string())
const hasLine = (items?: string[]) => !!items?.some((s) => s.trim())

export const bestPhoneSchema = () => {
  return z.object({
    title: z.string().min(1, "Title is required").max(200),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Lowercase words joined by "-", e.g. under-30000'
      ),
    intro: z.string().min(1, "Intro is required"),
    disclaimer: z.string().optional(),
    author: z.string().min(1, "Author is required"),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    thumbnail: z.string().optional().nullable(),
    min_price: z.coerce.number().min(0, "Min price must be 0 or greater"),
    max_price: z.coerce.number().min(0, "Max price must be 0 or greater"),
    tolerance_pct: z.coerce.number().min(0).max(20),
    last_reviewed_at: z.string().optional(),
    status: z.nativeEnum(BestPhoneStatus).default(BestPhoneStatus.INACTIVE),
    rankings: z
      .array(
        z
          .object({
            rank: z.coerce.number().min(1),
            phone_id: z.string().min(1, "Phone is required"),
            tier: z.nativeEnum(BestPhoneTier),
            badges: z.array(z.nativeEnum(BestPhoneBadge)),
            chips: lines,
            for_whom: z.string().min(1, '"For whom" is required'),
            pros: lines,
            cons: lines.refine(hasLine, "At least one limitation is required"),
            content: z.string().optional(),
            editor_note: z.string().optional(),
            label: z.string().optional(),
          })
          .refine((r) => r.tier !== BestPhoneTier.FULL || !!r.content?.trim(), {
            message: "Full cards need a paragraph",
            path: ["content"],
          })
      )
      .optional(),
    changes: z
      .array(
        z.object({
          month: z
            .string()
            .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
          items: z.array(
            z.object({
              type: z.nativeEnum(BestPhoneChangeType),
              phone_id: z.string().optional(),
              label: z.string().optional(),
              text: z.string().min(1, "Text is required"),
            })
          ),
        })
      )
      .optional(),
    faq: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        })
      )
      .optional(),
  })
}

export type BestPhoneFormValues = z.input<ReturnType<typeof bestPhoneSchema>>
