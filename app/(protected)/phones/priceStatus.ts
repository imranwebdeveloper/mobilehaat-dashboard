/**
 * Price status, same rule as the backend (ai/prompts/metadata.validator.ts)
 * and the website (frontend lib/phone-meta.ts):
 * - BD status UPCOMING / NOT_RELEASED → EXPECTED (price = approximate_price_bd),
 *   even when a variant already has a price;
 * - otherwise official > unofficial > expected from the variant prices.
 * The meta title depends on it, so AI metadata is regenerated only when it changes;
 * plain price edits are picked up by the website's live price sentence.
 */
export type PriceStatus = "OFFICIAL" | "UNOFFICIAL" | "EXPECTED"

const UPCOMING_BD_STATUSES = ["UPCOMING", "NOT_RELEASED"]

const positive = (n?: number) =>
  typeof n === "number" && !Number.isNaN(n) && n > 0

export function priceStatusOf(
  variants: Array<{ official_price?: number; unofficial_price?: number }>,
  bdStatus?: string | null
): PriceStatus {
  if (bdStatus && UPCOMING_BD_STATUSES.includes(bdStatus)) return "EXPECTED"
  if (variants.some((v) => positive(v.official_price))) return "OFFICIAL"
  if (variants.some((v) => positive(v.unofficial_price))) return "UNOFFICIAL"
  return "EXPECTED"
}

export const PRICE_STATUS_LABEL: Record<PriceStatus, string> = {
  OFFICIAL: "Official",
  UNOFFICIAL: "Unofficial",
  EXPECTED: "Expected",
}
