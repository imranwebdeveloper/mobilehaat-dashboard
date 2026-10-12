import z from "zod"

// Shape of the content workflow's 08_publish.json. Only the fields the
// budget guide form uses are listed; anything else in the file is ignored.
const rankingSchema = z.object({
  rank: z.union([z.number(), z.string()]),
  phone_title: z.string().nullish(),
  phone_slug: z.string().nullish(),
  phone_db_id: z.string().nullish(),
  page_price: z
    .object({
      price: z.number().nullish(),
      kind: z.string().nullish(),
    })
    .nullish(),
  content_html: z.string().nullish(),
  blocking: z.union([z.string(), z.array(z.string())]).nullish(),
})

const cmsSchema = z.object({
  title: z.string().min(1, "cms.title is missing"),
  slug: z.string().nullish(),
  intro: z.string().nullish(),
  rankings: z.array(rankingSchema).min(1, "cms.rankings is empty"),
  key_differences_html: z.string().nullish(),
  disclaimer_html: z.string().nullish(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer_html: z.string().nullish(),
      })
    )
    .nullish(),
  best_for: z.array(z.string()).nullish(),
  min_price: z.number().nullish(),
  max_price: z.number().nullish(),
  meta_title: z.string().nullish(),
  meta_description: z.string().nullish(),
  meta_keywords: z.string().nullish(),
  author: z.string().nullish(),
  status: z.string().nullish(),
})

export type WorkflowRanking = z.infer<typeof rankingSchema>
export type WorkflowCms = z.infer<typeof cmsSchema>

export interface WorkflowImport {
  cms: WorkflowCms
  workflowId?: string
  qcVerdict?: string
  publishStatus?: string
  blocking: string[]
  backups: WorkflowRanking[]
}

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : typeof value === "string" && value
      ? [value]
      : []

// Accepts either the whole 08_publish.json or just its `cms` object.
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
  const isWholeFile = !!root.cms && typeof root.cms === "object"
  const parsed = cmsSchema.safeParse(isWholeFile ? root.cms : root)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const path = issue.path.length ? `cms.${issue.path.join(".")}: ` : ""
    return { error: `${path}${issue.message}` }
  }

  const backups = isWholeFile
    ? z.array(rankingSchema).safeParse(root.backups)
    : null

  return {
    data: {
      cms: parsed.data,
      workflowId: isWholeFile ? (root.workflow_id as string) : undefined,
      qcVerdict: isWholeFile ? (root.qc_verdict as string) : undefined,
      publishStatus: isWholeFile ? (root.publish_status as string) : undefined,
      blocking: isWholeFile ? toStringList(root.blocking) : [],
      backups: backups?.success ? backups.data : [],
    },
  }
}
