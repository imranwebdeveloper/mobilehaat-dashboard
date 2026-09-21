import { AiGenerateResponse } from "./ai.types"
import { BudgetPhoneFormDraft } from "./ai.types"

export function mapAiToBudgetPhoneForm(
  response: AiGenerateResponse
): BudgetPhoneFormDraft {
  return {
    title: response.title || "",
    slug: response.slug || "",
    description: response.description || "",
    meta_title: response.meta_title || "",
    meta_description: response.meta_description || "",
    meta_keywords: response.meta_keywords || "",
    min_price: response.min_price || 0,
    max_price: response.max_price || 0,
    rankings: (response.rankings || []).map((r) => ({
      rank: r.rank,
      phone_id: r.phone_id,
      verdict: r.verdict || "",
    })),
    faq: (response.faq || []).map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
  }
}
