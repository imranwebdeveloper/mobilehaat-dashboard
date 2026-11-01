export const EXCHANGE_RATES = {
  USD: 123,
  CNY: 18,
  EUR: 128,
  INR: 1.3,
  BDT: 1,
} as const

export type Currency = keyof typeof EXCHANGE_RATES

export const BRAND_FACTOR_DEFAULT = 1.15

export interface BrandFactorsConfig {
  default: number
  overrides: Record<string, number>
}

export interface PriceCalculationInput {
  price: number
  currency: Currency
  brandFactor?: number
  exchangeRate?: number
}

export interface PriceCalculationResult {
  price: number
  currency: Currency
  exchangeRate: number
  brandFactor: number
  converted: number
  raw: number
  rounded: number
}

function roundToPricePoint(bdt: number): number {
  if (bdt <= 0) return 0
  const step = bdt < 10_000 ? 500 : 1_000
  return Math.ceil(bdt / step) * step - 1
}

function getBrandFactor(brandName: string | undefined, config: BrandFactorsConfig): number {
  if (!brandName) return config.default
  const key = brandName.trim().toLowerCase()
  return config.overrides[key] ?? config.default
}

function getExchangeRate(currency: Currency, override?: number): number {
  if (override) return override
  return EXCHANGE_RATES[currency]
}

export function calculateBdPrice(
  input: PriceCalculationInput,
  brandName?: string,
  brandFactors?: BrandFactorsConfig
): PriceCalculationResult {
  const currency = input.currency.toUpperCase() as Currency
  const exchangeRate = getExchangeRate(currency, input.exchangeRate)
  const factorConfig: BrandFactorsConfig = brandFactors ?? {
    default: BRAND_FACTOR_DEFAULT,
    overrides: {},
  }
  const brandFactor = input.brandFactor ?? getBrandFactor(brandName, factorConfig)

  const converted = input.price * exchangeRate
  const raw = converted * brandFactor

  return {
    price: input.price,
    currency,
    exchangeRate,
    brandFactor,
    converted: Math.round(converted),
    raw: Math.round(raw),
    rounded: roundToPricePoint(raw),
  }
}

export { roundToPricePoint, getBrandFactor, getExchangeRate }