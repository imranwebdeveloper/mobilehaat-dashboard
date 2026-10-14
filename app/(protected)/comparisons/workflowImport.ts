import z from "zod"

// Shape of the comparison workflow's 06_publish.json
// (docs/Comparison_Workflow/tools/build_handoff.mjs). Only the fields the
// comparison form uses are listed; anything else in the file is ignored.
const scorePair = z.object({
  phone_a: z.coerce.number(),
  phone_b: z.coerce.number(),
})

const SCORE_KEYS = [
  "display",
  "performance",
  "camera",
  "battery",
  "design",
  "value",
  "overall",
  "best_value",
] as const

const cmsSchema = z.object({
  title: z.string().min(1, "cms.title is missing"),
  slug: z.string().nullish(),
  phones: z.array(z.string()).nullish(),
  author: z.string().nullish(),
  intro: z.string().nullish(),
  verdict: z.string().nullish(),
  best_for: z
    .object({
      phone_a: z.string().nullish(),
      phone_b: z.string().nullish(),
    })
    .nullish(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .nullish(),
  key_differences: z
    .array(
      z.object({
        category: z.enum([
          "display",
          "performance",
          "camera",
          "battery",
          "design",
          "value",
        ]),
        phone_a_value: z.string().min(1).max(100),
        phone_b_value: z.string().min(1).max(100),
        point: z.string().max(300).nullish(),
        winner: z.enum(["phone_a", "phone_b"]),
      })
    )
    .max(6, "cms.key_differences has more than 6 rows")
    .nullish(),
  scores: z
    .object(Object.fromEntries(SCORE_KEYS.map((k) => [k, scorePair])))
    .nullish(),
  meta_title: z.string().nullish(),
  meta_description: z.string().nullish(),
  status: z.string().nullish(),
})

const phoneRefSchema = z.object({
  title: z.string().nullish(),
  slug: z.string().nullish(),
  db_id: z.string().nullish(),
})

export type ComparisonWorkflowCms = z.infer<typeof cmsSchema>
export type ComparisonWorkflowScores = Record<
  (typeof SCORE_KEYS)[number],
  { phone_a: number; phone_b: number }
>
export type WorkflowPhoneRef = z.infer<typeof phoneRefSchema>
export { SCORE_KEYS }

export interface ComparisonWorkflowImport {
  cms: ComparisonWorkflowCms
  // Phone A and phone B, in page order: db_id first, slug as fallback.
  phones: WorkflowPhoneRef[]
  runId?: string
  mode?: string
  updateUrl?: string
  qcVerdict?: string
  scoresSource?: string
  checkErrors: string[]
  followups: string[]
}

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : []

// phone_page_followups rows are objects ({phone, field, db_value, …}); show
// them as one readable line each.
const describeFollowup = (value: unknown): string | null => {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return null
  const f = value as Record<string, unknown>
  const parts = [
    f.phone,
    f.field,
    f.db_value != null ? `DB: ${String(f.db_value)}` : null,
    f.verified_value != null ? `verified: ${String(f.verified_value)}` : null,
    f.note,
  ].filter((p) => p != null && p !== "")
  return parts.length ? parts.map(String).join(" · ") : null
}

// Accepts either the whole 06_publish.json or just its `cms` object.
export function parseComparisonWorkflowJson(
  text: string
):
  | { data: ComparisonWorkflowImport; error?: undefined }
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
  const cms = parsed.data

  // Prefer the whole file's phone records (they carry slugs for the
  // fallback lookup); otherwise use cms.phones ids.
  let phones: WorkflowPhoneRef[] = []
  if (isWholeFile && root.phones && typeof root.phones === "object") {
    const p = root.phones as Record<string, unknown>
    const a = phoneRefSchema.safeParse(p.phone_a)
    const b = phoneRefSchema.safeParse(p.phone_b)
    if (a.success && b.success) phones = [a.data, b.data]
  }
  if (!phones.length) {
    phones = (cms.phones || []).map((id) => ({ db_id: id }))
  }
  if (phones.length !== 2) {
    return {
      error: `A comparison needs exactly 2 phones; the file has ${phones.length}.`,
    }
  }

  const checks = (root.checks || {}) as Record<string, unknown>
  const qc = (root.qc || {}) as Record<string, unknown>

  return {
    data: {
      cms,
      phones,
      runId: isWholeFile ? (root.run_id as string) : undefined,
      mode: isWholeFile ? (root.mode as string) : undefined,
      updateUrl: isWholeFile
        ? ((root.update_url as string) ?? undefined)
        : undefined,
      qcVerdict: isWholeFile ? (qc.verdict as string) : undefined,
      scoresSource: isWholeFile ? (checks.scores_source as string) : undefined,
      checkErrors: isWholeFile ? toStringList(checks.errors) : [],
      followups:
        isWholeFile && Array.isArray(root.phone_page_followups)
          ? root.phone_page_followups
              .map(describeFollowup)
              .filter((s): s is string => !!s)
          : [],
    },
  }
}
