"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Loader2,
  X,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calculator,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PriceConverter } from "@/components/common/PriceConverter"
import { useAiCheckPriceMutation, useAiCheckCreateMutation } from "@/app/(protected)/price-watch/price-watch.api"
import { PriceAiCheckResult, PriceAiCheckEntry, AiCheckFlag, AiSuggestionKind } from "@/app/(protected)/price-watch/price-watch.type"
import { cn } from "@/lib/utils"
import { calculateBdPrice, Currency } from "@/lib/price-calculator"

interface AiPriceCheckModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneTitle: string
  brand: string
  model: string
  variants: Array<{ ram: number; storage: number; official_price?: number; unofficial_price?: number; _id?: string }>
  mode: "expected" | "bd-prices"
  onPriceSelected: (data: {
    type: "expected" | "variant"
    price: number
    basis?: string
    confidence?: string
    variantIndex?: number
    official_price?: number
    unofficial_price?: number
  }) => void
}

const MARKET_FLAGS: Record<string, string> = {
  INDIA: "🇮🇳",
  USA: "🇺🇸",
  EUROPE: "🇪🇺",
  CHINA: "🇨🇳",
  BD: "🇧🇩",
}

const MARKET_LABELS: Record<string, string> = {
  INDIA: "India",
  USA: "USA",
  EUROPE: "Europe",
  CHINA: "China",
  BD: "Bangladesh",
}

const FLAG_LABELS: Record<AiCheckFlag, string> = {
  BIG_CHANGE: "Big price change",
  LOOKS_LAUNCHED: "BD launch detected",
  UNMATCHED_VARIANTS: "Unmatched variants",
  UNVERIFIED_SOURCE: "Unverified source",
}

const SUGGESTION_COLORS: Record<AiSuggestionKind, string> = {
  OFFICIAL: "bg-green-100 text-green-800 border-green-200",
  UNOFFICIAL: "bg-blue-100 text-blue-800 border-blue-200",
  EXPECTED: "bg-purple-100 text-purple-800 border-purple-200",
  NONE: "bg-gray-100 text-gray-600 border-gray-200",
}

const SUGGESTION_ICONS: Record<AiSuggestionKind, string> = {
  OFFICIAL: "✅",
  UNOFFICIAL: "🏪",
  EXPECTED: "🧮",
  NONE: "❌",
}

function PriceEntryCard({
  entry,
  variantLabels,
  onUse,
  isOfficial,
}: {
  entry: PriceAiCheckEntry
  variantLabels: string[]
  onUse: () => void
  isOfficial?: boolean
}) {
  const variantLabel = entry.variant || (entry.variantId ? variantLabels.find(v => v.includes(entry.variantId?.slice(-6) || "")) : "Unknown")
  const marketLabel = entry.market ? `${MARKET_FLAGS[entry.market]} ${MARKET_LABELS[entry.market]}` : "Bangladesh"
  const currencySymbol = entry.currency === "BDT" ? "৳" : entry.currency === "INR" ? "₹" : entry.currency === "USD" ? "$" : entry.currency === "EUR" ? "€" : entry.currency === "CNY" ? "¥" : entry.currency

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-primary/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{currencySymbol}{entry.price.toLocaleString()}</span>
          <span className="text-xs text-gray-500">({variantLabel})</span>
          <Badge variant="secondary" className="text-[10px]">{marketLabel}</Badge>
          {entry.verified && <CheckCircle className="size-3 text-green-500" aria-label="Verified source" />}
          {!entry.verified && <AlertCircle className="size-3 text-yellow-500" aria-label="Unverified source" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <Globe className="size-3" />
          <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 truncate block max-w-xs">
            {entry.source_name}
          </a>
          {entry.date && <span>· {entry.date}</span>}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onUse}
        className="whitespace-nowrap"
      >
        Use
      </Button>
    </div>
  )
}

function PriceSection({
  title,
  entries,
  variantLabels,
  onUse,
  color,
  isOfficial,
}: {
  title: string
  entries: PriceAiCheckEntry[]
  variantLabels: string[]
  onUse: (entry: PriceAiCheckEntry) => void
  color: string
  isOfficial?: boolean
}) {
  if (!entries.length) return null

  return (
    <div className="space-y-3">
      <h4 className={cn("font-medium text-sm", `text-${color}-700`)}>{title}</h4>
      <ScrollArea className="max-h-64">
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <PriceEntryCard
              key={i}
              entry={entry}
              variantLabels={variantLabels}
              onUse={() => onUse(entry)}
              isOfficial
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function SuggestionBadge({ suggestion }: { suggestion: PriceAiCheckResult["suggestion"] }) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium", SUGGESTION_COLORS[suggestion.kind])}>
      <span>{SUGGESTION_ICONS[suggestion.kind]}</span>
      <span className="uppercase">{suggestion.kind}</span>
      {suggestion.changePct !== null && (
        <span className={cn("px-2 py-0.5 rounded text-xs font-mono", suggestion.changePct > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
          {suggestion.changePct > 0 ? "+" : ""}{suggestion.changePct.toFixed(1)}%
        </span>
      )}
      {suggestion.lowestBdt && (
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700">
          Lowest: ৳{suggestion.lowestBdt.toLocaleString()}
        </span>
      )}
    </div>
  )
}

function FlagsDisplay({ flags }: { flags: AiCheckFlag[] }) {
  if (!flags.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <Badge key={flag} variant="secondary" className="text-[10px]">
          <Flag className="size-2.5 mr-1" />
          {FLAG_LABELS[flag]}
        </Badge>
      ))}
    </div>
  )
}

export function AiPriceCheckModal({
  open,
  onOpenChange,
  phoneTitle,
  brand,
  model,
  variants,
  mode,
  onPriceSelected,
}: AiPriceCheckModalProps) {
  const [isResearching, setIsResearching] = useState(false)
  const [result, setResult] = useState<PriceAiCheckResult | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bd_official: true,
    bd_unofficial: true,
    global: true,
  })

  const [aiCheck] = useAiCheckPriceMutation()
  const [aiCheckCreate] = useAiCheckCreateMutation()

  // Check if we have a real phoneId (existing phone) or need to use create endpoint
  const hasRealPhoneId = variants.some(v => v._id && v._id.length === 24 && /^[a-fA-F0-9]{24}$/.test(v._id))
  const phoneId = variants.find(v => v._id) ?._id

  const variantLabels = variants.map((v, i) => `${v.ram}GB/${v.storage}GB (idx ${i})`)

  // Map variantId from AI result to local variant index
  const getVariantIndex = (variantId?: string | null): number | undefined => {
    if (!variantId) return undefined
    return variants.findIndex(v => v._id === variantId)
  }

  const handleResearch = async () => {
    if (!phoneTitle.trim()) {
      toast.error("Phone title is required")
      return
    }

    setIsResearching(true)
    try {
      let res
      if (hasRealPhoneId && phoneId) {
        // Existing phone - use phoneId endpoint
        res = await aiCheck({ phoneId, force: true }).unwrap()
      } else {
        // New phone - use create endpoint
        res = await aiCheckCreate({
          title: phoneTitle,
          brand,
          model,
          variants: variants.map(v => ({
            ram: v.ram,
            storage: v.storage,
            official_price: v.official_price,
            unofficial_price: v.unofficial_price,
          })),
        }).unwrap()
      }
      
      if (res.status && res.data) {
        setResult(res.data)
        toast.success("Price research complete")
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Price research failed")
    } finally {
      setIsResearching(false)
    }
  }

  const handleUsePrice = (entry: PriceAiCheckEntry) => {
    const currency = entry.currency as Currency
    const calc = calculateBdPrice({ price: entry.price, currency }, brand)
    const variantIndex = getVariantIndex(entry.variantId)

    if (mode === "expected") {
      // For expected price: use global prices, return price + basis + confidence
      const market = entry.market || "GLOBAL"
      const basis = `${market} ${entry.currency === "INR" ? "₹" : entry.currency === "USD" ? "$" : entry.currency === "EUR" ? "€" : "¥"}${entry.price.toLocaleString()}`
      const confidence = market === "INDIA" ? "GLOBAL_LAUNCH" : "RUMOUR"
      
      onPriceSelected({
        type: "expected",
        price: calc.rounded,
        basis,
        confidence,
      })
    } else {
      // For bd-prices: use BD prices, return per-variant official/unofficial
      onPriceSelected({
        type: "variant",
        price: calc.rounded,
        variantIndex,
        official_price: entry.currency === "BDT" && result?.bd_official.some(e => e.variantId === entry.variantId) ? calc.rounded : undefined,
        unofficial_price: entry.currency === "BDT" && result?.bd_unofficial.some(e => e.variantId === entry.variantId) ? calc.rounded : undefined,
      })
    }
    
    onOpenChange(false)
    toast.success(`Applied ৳${calc.rounded.toLocaleString()}`)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="size-5" />
            AI Market Price Research
          </DialogTitle>
          <DialogDescription>
            Research current market prices for <strong>{phoneTitle}</strong> ({brand} {model}) across Bangladesh and global markets.
            Select a price to auto-fill as approximate BD price or variant prices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phone Info & Research Button */}
          <Card>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Brand:</span> {brand}</div>
                  <div><span className="text-muted-foreground">Model:</span> {model}</div>
                  <div><span className="text-muted-foreground">Variants:</span> {variants.length} ({variants.map(v => `${v.ram}GB/${v.storage}GB`).join(", ")})</div>
                  <div><span className="text-muted-foreground">Brand Factor:</span> ~1.15x</div>
                </div>
                <Button
                  onClick={handleResearch}
                  disabled={isResearching || !phoneTitle.trim()}
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Researching Prices...
                    </>
                  ) : (
                    <>
                      <Globe className="size-4" />
                      Research Market Prices
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Suggestion & Flags */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">AI Suggestion</CardTitle>
                    <SuggestionBadge suggestion={result.suggestion} />
                  </div>
                  {result.suggestion.reason && (
                    <DialogDescription>{result.suggestion.reason}</DialogDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <FlagsDisplay flags={result.flags} />
                </CardContent>
              </Card>

              {/* Price Sections */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">BD Official</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection("bd_official")}
                      >
                        {expandedSections.bd_official ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedSections.bd_official && (
                    <CardContent className="pt-0">
                      <PriceSection
                        title="Official Bangladesh Prices"
                        entries={result.bd_official}
                        variantLabels={variantLabels}
                        onUse={handleUsePrice}
                        color="green"
                        isOfficial
                      />
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">BD Unofficial</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection("bd_unofficial")}
                      >
                        {expandedSections.bd_unofficial ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedSections.bd_unofficial && (
                    <CardContent className="pt-0">
                      <PriceSection
                        title="Retailer / Grey Market Prices"
                        entries={result.bd_unofficial}
                        variantLabels={variantLabels}
                        onUse={handleUsePrice}
                        color="blue"
                      />
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Global</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection("global")}
                      >
                        {expandedSections.global ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedSections.global && (
                    <CardContent className="pt-0">
                      <PriceSection
                        title="Global Launch Prices"
                        entries={result.global}
                        variantLabels={variantLabels}
                        onUse={handleUsePrice}
                        color="purple"
                      />
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Sources */}
              {result.sources.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Sources ({result.sources.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="max-h-40">
                      <ul className="space-y-1 text-sm">
                        {result.sources.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-600">
                            <Globe className="size-3.5" />
                            <a href={s.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 truncate max-w-xs">
                              {s.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Calculator for manual entry */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Manual Price Conversion</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <PriceConverter
                    brandName={brand}
                    onSelect={(calcResult) => {
                      if (mode === "expected") {
                        onPriceSelected({
                          type: "expected",
                          price: calcResult.rounded,
                          basis: `Manual ${calcResult.currency} ${calcResult.price.toLocaleString()}`,
                          confidence: "RUMOUR",
                        })
                      } else {
                        onPriceSelected({
                          type: "variant",
                          price: calcResult.rounded,
                        })
                      }
                      onOpenChange(false)
                      toast.success(`Applied ৳${calcResult.rounded.toLocaleString()}`)
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* No result yet */}
          {!result && !isResearching && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Globe className="size-12 mx-auto mb-3 opacity-50" />
                <p>Click &ldquo;Research Market Prices&rdquo; to fetch current prices from AI</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}