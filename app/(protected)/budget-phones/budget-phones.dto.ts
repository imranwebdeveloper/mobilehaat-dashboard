import z from "zod"
import { BudgetPhoneStatus } from "./budget-phones.type"

export const budgetPhoneSchema = () => {
  return z.object({
    title: z.string().min(1, "Title is required").max(200),
    slug: z.string().min(1, "Slug is required").max(200).optional(),
    description: z.string().min(1, "Description is required"),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    thumbnail: z.string().optional().nullable(),
    min_price: z.coerce.number().min(0, "Min price must be 0 or greater"),
    max_price: z.coerce.number().min(0, "Max price must be 0 or greater"),
    status: z.nativeEnum(BudgetPhoneStatus).default(BudgetPhoneStatus.ACTIVE),
    rankings: z
      .array(
        z.object({
          rank: z.coerce.number().min(1),
          phone_id: z.string().min(1),
          verdict: z.string().optional(),
          label: z.string().optional(),
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

export type BudgetPhoneFormValues = z.input<
  ReturnType<typeof budgetPhoneSchema>
>
