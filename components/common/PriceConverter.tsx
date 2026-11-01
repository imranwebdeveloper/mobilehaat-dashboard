"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calculator,
  CheckCircle,
  ArrowRight,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  calculateBdPrice,
  PriceCalculationInput,
  PriceCalculationResult,
  Currency,
  EXCHANGE_RATES,
  BRAND_FACTOR_DEFAULT,
} from "@/lib/price-calculator"
import { useGetExpectedDefaultsQuery } from "@/app/(protected)/price-watch/price-watch.api"

interface PriceConverterProps {
  initialPrice?: number
  initialCurrency?: Currency
  brandName?: string
  onSelect: (result: PriceCalculationResult) => void
  variant?: "inline" | "card" | "modal"
  readOnly?: boolean
  className?: string
}

const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: "🇺🇸",
  CNY: "🇨🇳",
  EUR: "🇪🇺",
  INR: "🇮🇳",
  BDT: "🇧🇩",
}

const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "US Dollar (USD)",
  CNY: "Chinese Yuan (CNY)",
  EUR: "Euro (EUR)",
  INR: "Indian Rupee (INR)",
  BDT: "Bangladeshi Taka (BDT)",
}

export function PriceConverter({
  initialPrice,
  initialCurrency,
  brandName,
  onSelect,
  variant = "card",
  readOnly = false,
  className,
}: PriceConverterProps) {
  const { data: defaultsRes } = useGetExpectedDefaultsQuery(null, {
    skip: !initialPrice,
  })

  const brandFactors = defaultsRes?.data?.brandFactors ?? {}
  const defaultBrandFactor = defaultsRes?.data?.defaultBrandFactor ?? BRAND_FACTOR_DEFAULT

  const [price, setPrice] = useState(initialPrice?.toString() ?? "")
  const [currency, setCurrency] = useState<Currency>(initialCurrency ?? "INR")
  const [exchangeRate, setExchangeRate] = useState("")
  const [brandFactor, setBrandFactor] = useState("")
  const [result, setResult] = useState<PriceCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const defaultRate = currency === "BDT" ? 1 : EXCHANGE_RATES[currency]

  useEffect(() => {
    if (initialPrice) setPrice(initialPrice.toString())
  }, [initialPrice])

  useEffect(() => {
    if (initialCurrency) setCurrency(initialCurrency)
  }, [initialCurrency])

  const handleCalculate = async () => {
    const value = Number(price)
    if (!value || value <= 0) return

    setIsCalculating(true)
    try {
      const calcResult = calculateBdPrice(
        {
          price: value,
          currency,
          exchangeRate: exchangeRate ? Number(exchangeRate) : undefined,
          brandFactor: brandFactor ? Number(brandFactor) : undefined,
        },
        brandName,
        {
          default: defaultBrandFactor,
          overrides: brandFactors,
        }
      )
      setResult(calcResult)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSelect = () => {
    if (result) onSelect(result)
  }

  const currencyOptions: Currency[] = ["INR", "USD", "EUR", "CNY", "BDT"]

  const content = (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-2 sm:grid-cols-4">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="pc-price">Foreign Price</Label>
          <Input
            id="pc-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29999"
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1">
          <Label>Currency</Label>
          <Select
            value={currency}
            onValueChange={(v) => {
              setCurrency(v as Currency)
              setExchangeRate("")
              setResult(null)
            }}
            disabled={readOnly}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  <div className="flex items-center gap-2">
                    <span>{CURRENCY_FLAGS[c]}</span>
                    <span>{CURRENCY_LABELS[c]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pc-rate">Rate (৳ per unit)</Label>
          <Input
            id="pc-rate"
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder={defaultRate ? String(defaultRate) : ""}
            disabled={currency === "BDT" || readOnly}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pc-factor">BD Market Factor</Label>
          <Input
            id="pc-factor"
            type="number"
            step="0.01"
            value={brandFactor}
            onChange={(e) => setBrandFactor(e.target.value)}
            placeholder={String(defaultBrandFactor)}
            disabled={readOnly}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Empty rate / factor use defaults. Rate: {defaultRate} ৳/{currency}. Factor: {defaultBrandFactor}x.
        {brandName && brandFactors[brandName.toLowerCase()] && ` Brand override: ${brandFactors[brandName.toLowerCase()]}x.`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCalculate}
          disabled={isCalculating || readOnly || !price}
        >
          {isCalculating ? (
            <>
              <Calculator className="size-3.5 animate-spin mr-1" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="size-3.5 mr-1" />
              Calculate
            </>
          )}
        </Button>

        {result && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono">
                {result.price.toLocaleString()} {result.currency} × {result.exchangeRate} × {result.brandFactor}
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <strong className="text-green-600">৳{result.rounded.toLocaleString()}</strong>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleSelect}
              className="gap-1"
            >
              <CheckCircle className="size-3.5" />
              Use ৳{result.rounded.toLocaleString()}
            </Button>
          </>
        )}
      </div>

      {variant !== "inline" && (
        <p className="text-xs text-muted-foreground">
          Conversion: {result?.price.toLocaleString()} {result?.currency} ×{" "}
          {result?.exchangeRate} (rate) × {result?.brandFactor} (factor) ={" "}
          ৳{result?.converted?.toLocaleString()} → rounded ৳{result?.rounded?.toLocaleString()}
        </p>
      )}
    </div>
  )

  if (variant === "inline") {
    return <div className={cn("flex items-center gap-2", className)}>{content}</div>
  }

  return (
    <div className={cn("rounded-lg border bg-muted/40 p-3", variant === "card" && "p-4", className)}>
      {content}
    </div>
  )
}

export function PriceConverterInline(props: Omit<PriceConverterProps, "variant">) {
  return <PriceConverter {...props} variant="inline" />
}