import z from "zod"
import { ComparisonStatus } from "./comparisons.type"

const scorePairSchema = z.object({
  phone_a: z.number(),
  phone_b: z.number(),
})

const scoresSchema = z.object({
  display: scorePairSchema,
  performance: scorePairSchema,
  camera: scorePairSchema,
  battery: scorePairSchema,
  design: scorePairSchema,
  value: scorePairSchema,
  overall: scorePairSchema,
  best_value: scorePairSchema,
})

const bestForSchema = z.object({
  phone_a: z.string(),
  phone_b: z.string(),
})

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

export const comparisonSchema = () => {
  return z.object({
    title: z.string().min(1, "Title is required").max(200),
    slug: z.string().min(1, "Slug is required").max(200).optional(),
    phones: z
      .array(z.string())
      .min(2, "At least 2 phones are required for comparison"),
    thumbnail: z.string().min(1, "Thumbnail is required"),
    intro: z.string().optional(),
    verdict: z.string().optional(),
    best_for: bestForSchema.optional(),
    faqs: z.array(faqSchema).optional(),
    scores: scoresSchema.optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    analysisId: z.string().optional(),
    status: z.nativeEnum(ComparisonStatus).default(ComparisonStatus.DRAFT),
  })
}

export type ComparisonFormValues = z.input<ReturnType<typeof comparisonSchema>>
