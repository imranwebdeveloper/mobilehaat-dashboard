"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Calculator } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  useCalculateExpectedMutation,
  useGetExpectedDefaultsQuery,
  useSaveExpectedPriceMutation,
} from "./price-watch.api"
import {
  ExpectedCalculation,
  ExpectedPriceConfidence,
  PhonePriority,
} from "./price-watch.type"
import { CONFIDENCE, CURRENCY_SYMBOL } from "./priority.constant"

const errorMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "")

const ExpectedPriceDialog = ({
  row,
  open,
  onOpenChange,
}: {
  row: PhonePriority
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const current = row.expected
  const [price, setPrice] = useState<string>(
    String(current?.price ?? row.approximate_price_bd ?? "")
  )
  const [basis, setBasis] = useState(current?.basis ?? "")
  const [confidence, setConfidence] = useState<ExpectedPriceConfidence>(
    current?.confidence ?? "RUMOUR"
  )
  const [launchBd, setLaunchBd] = useState(toDateInput(current?.launch_bd))

  // Calculator
  const { data: defaultsRes } = useGetExpectedDefaultsQuery(null, {
    skip: !open,
  })
  const defaults = defaultsRes?.data
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [rate, setRate] = useState("")
  const [factor, setFactor] = useState("")
  const [result, setResult] = useState<ExpectedCalculation | null>(null)

  const [calculate, { isLoading: calculating }] = useCalculateExpectedMutation()
  const [save, { isLoading: saving }] = useSaveExpectedPriceMutation()

  const currencies = ["BDT", ...Object.keys(defaults?.exchangeRatesToBdt ?? {})]
  const defaultRate =
    currency === "BDT" ? 1 : defaults?.exchangeRatesToBdt[currency]

  const handleCalculate = async () => {
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error("Enter the foreign price first")
      return
    }
    try {
      const res = await calculate({
        amount: value,
        currency,
        rate: rate ? Number(rate) : undefined,
        factor: factor ? Number(factor) : undefined,
        phoneId: row.id,
      }).unwrap()
      setResult(res.data)
    } catch (error) {
      toast.error(errorMessage(error, "Calculation failed"))
    }
  }

  const applyResult = () => {
    if (!result) return
    setPrice(String(result.rounded))
    if (!basis.trim() && result.currency !== "BDT") {
      const symbol = CURRENCY_SYMBOL[result.currency] ?? `${result.currency} `
      const market = result.currency === "INR" ? "India launch" : "Global"
      setBasis(`${market} ${symbol}${result.amount.toLocaleString()}`)
    }
    if (confidence === "RUMOUR" && result.currency !== "BDT") {
      setConfidence("GLOBAL_LAUNCH")
    }
  }

  const handleSave = async () => {
    const value = Number(price)
    if (!Number.isInteger(value) || value <= 0) {
      toast.error("Expected price must be a whole number above 0")
      return
    }
    try {
      await save({
        phoneId: row.id,
        body: {
          price: value,
          basis: basis.trim() || undefined,
          confidence,
          launch_bd: launchBd || undefined,
        },
      }).unwrap()
      toast.success(`${row.title}: expected price saved`)
      onOpenChange(false)
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save expected price"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Expected price — {row.title}</DialogTitle>
          <DialogDescription>
            Shown on the site as the expected BD price until the phone launches
            in Bangladesh.
          </DialogDescription>
        </DialogHeader>

        {/* Calculator */}
        <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="size-4" /> Calculate from a foreign price
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="col-span-2 space-y-1 sm:col-span-1">
              <Label htmlFor="ep-amount">Price</Label>
              <Input
                id="ep-amount"
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="29999"
                className="bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => {
                  setCurrency(v)
                  setRate("")
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ep-rate">Rate (৳)</Label>
              <Input
                id="ep-rate"
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder={defaultRate ? String(defaultRate) : ""}
                disabled={currency === "BDT"}
                className="bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ep-factor">BD factor</Label>
              <Input
                id="ep-factor"
                type="number"
                step="0.01"
                value={factor}
                onChange={(e) => setFactor(e.target.value)}
                placeholder={String(defaults?.defaultBrandFactor ?? "")}
                className="bg-background"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Empty rate / factor use the defaults shown — check the rate against
            today&apos;s market before saving.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCalculate}
              disabled={calculating}
            >
              Calculate
            </Button>
            {result && (
              <>
                <span className="text-sm tabular-nums">
                  {result.amount.toLocaleString()} {result.currency} ×{" "}
                  {result.rate} × {result.factor} = ৳
                  {result.raw.toLocaleString()} →{" "}
                  <strong>৳{result.rounded.toLocaleString()}</strong>
                </span>
                <Button type="button" size="sm" onClick={applyResult}>
                  Use ৳{result.rounded.toLocaleString()}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Saved values */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ep-price">Expected BD price (৳)</Label>
            <Input
              id="ep-price"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Confidence</Label>
            <Select
              value={confidence}
              onValueChange={(v) => setConfidence(v as ExpectedPriceConfidence)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CONFIDENCE) as ExpectedPriceConfidence[]).map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {CONFIDENCE[c].label}
                      <span className="ml-1 text-muted-foreground">
                        — {CONFIDENCE[c].hint}
                      </span>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ep-basis">Basis</Label>
            <Input
              id="ep-basis"
              value={basis}
              maxLength={200}
              onChange={(e) => setBasis(e.target.value)}
              placeholder="India launch ₹29,999"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ep-launch">Expected BD launch</Label>
            <Input
              id="ep-launch"
              type="date"
              value={launchBd}
              onChange={(e) => setLaunchBd(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Save expected price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExpectedPriceDialog
