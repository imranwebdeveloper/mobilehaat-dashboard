/**
 * Price status, same precedence as the backend (ai/prompts/metadata.validator.ts)
 * and the website (frontend lib/phone-meta.ts): official > unofficial > expected.
 * The meta title depends on it, so AI metadata is regenerated only when it changes;
 * plain price edits are picked up by the website's live price sentence.
 */
export type PriceStatus = "OFFICIAL" | "UNOFFICIAL" | "EXPECTED"

const positive = (n?: number) =>
  typeof n === "number" && !Number.isNaN(n) && n > 0

export function priceStatusOf(
  variants: Array<{ official_price?: number; unofficial_price?: number }>
): PriceStatus {
  if (variants.some((v) => positive(v.official_price))) return "OFFICIAL"
  if (variants.some((v) => positive(v.unofficial_price))) return "UNOFFICIAL"
  return "EXPECTED"
}

export const PRICE_STATUS_LABEL: Record<PriceStatus, string> = {
  OFFICIAL: "Official",
  UNOFFICIAL: "Unofficial",
  EXPECTED: "Expected",
}
