import z from "zod"

// Shape of the best-phone workflow's cards.json. Only the fields the form
// uses are listed; anything else in the file (badge_basis, spoken_line,
// pronounce, not_selected …) is for the video and social tools and ignored.

// A pro/con/chip may be a plain string or {text, source}.
const textItem = z
  .union([z.string(), z.object({ text: z.string() }).passthrough()])
  .transform((v) => (typeof v === "string" ? v : v.text))

const rankingSchema = z.object({
  rank: z.union([z.number(), z.string()]),
  tier: z.string().nullish(),
  phone_title: z.string().nullish(),
  phone_slug: z.string().nullish(),
  phone_db_id: z.string().nullish(),
  page_price: z
    .object({
      price: z.number().nullish(),
      kind: z.string().nullish(),
    })
    .nullish(),
  badges: z.array(z.string()).nullish(),
  chips: z.array(z.string()).nullish(),
  for_whom: z.string().nullish(),
  pros: z.array(textItem).nullish(),
  cons: z.array(textItem).nullish(),
  content_html: z.string().nullish(),
  editor_note: z.string().nullish(),
})

const changeItemSchema = z.object({
  type: z.string(),
  phone_slug: z.string().nullish(),
  phone_db_id: z.string().nullish(),
  text: z.string(),
})

const pageSchema = z.object({
  title: z.string().min(1, "page.title is missing"),
  slug: z.string().nullish(),
  intro: z.string().nullish(),
  disclaimer_html: z.string().nullish(),
  min_price: z.number().nullish(),
  max_price: z.number().nullish(),
  tolerance_pct: z.number().nullish(),
  last_reviewed_at: z.string().nullish(),
  meta_title: z.string().nullish(),
  meta_description: z.string().nullish(),
  meta_keywords: z.string().nullish(),
  author: z.string().nullish(),
  status: z.string().nullish(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer_html: z.string().nullish(),
      })
    )
    .nullish(),
  changes: z
    .array(
      z.object({
        month: z.string(),
        items: z.array(changeItemSchema),
      })
    )
    .nullish(),
})

export type WorkflowRanking = z.infer<typeof rankingSchema>
export type WorkflowChangeItem = z.infer<typeof changeItemSchema>
export type WorkflowPage = z.infer<typeof pageSchema>

export interface WorkflowImport {
  page: WorkflowPage
  rankings: WorkflowRanking[]
  blocking: string[]
}

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : typeof value === "string" && value
      ? [value]
      : []

// Accepts the whole cards.json ({ page, rankings, blocking? }).
export function parseWorkflowJson(
  text: string
):
  | { data: WorkflowImport; error?: undefined }
  | { data?: undefined; error: string } {
  let raw: unknown
  try {
    raw = JSON.parse(text.replace(/^﻿/, ""))
  } catch (e) {
    return { error: `Not valid JSON: ${(e as Error).message}` }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Expected a JSON object." }
  }

  const root = raw as Record<string, unknown>
  const page = pageSchema.safeParse(root.page)
  if (!page.success) {
    const issue = page.error.issues[0]
    const path = issue.path.length ? `page.${issue.path.join(".")}: ` : ""
    return { error: `${path}${issue.message}` }
  }

  const rankings = z
    .array(rankingSchema)
    .min(1, "rankings is empty")
    .safeParse(root.rankings)
  if (!rankings.success) {
    const issue = rankings.error.issues[0]
    const path = issue.path.length ? `rankings.${issue.path.join(".")}: ` : ""
    return { error: `${path}${issue.message}` }
  }

  return {
    data: {
      page: page.data,
      rankings: rankings.data,
      blocking: toStringList(root.blocking),
    },
  }
}
