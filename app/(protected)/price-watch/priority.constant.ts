import {
  ExpectedPriceConfidence,
  PriceBadge,
  PriceStage,
} from "./price-watch.type"

export const STAGES: Record<
  PriceStage,
  { label: string; emoji: string; interval: string; className: string }
> = {
  LAUNCH: {
    label: "Launch",
    emoji: "🚀",
    interval: "0–3 mo · every 7d",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  FRESH: {
    label: "Fresh",
    emoji: "📈",
    interval: "3–6 mo · every 10d",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  STABLE: {
    label: "Stable",
    emoji: "📊",
    interval: "6–12 mo · every 12d",
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
  MATURE: {
    label: "Mature",
    emoji: "📉",
    interval: "1–2 yr · every 15d",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  OLD: {
    label: "Old",
    emoji: "🕰",
    interval: "2+ yr · frozen",
    className: "border-gray-200 bg-gray-50 text-gray-500",
  },
  UPCOMING: {
    label: "Upcoming",
    emoji: "🔮",
    interval: "expected price · 14d",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
  SKIP: {
    label: "Skip",
    emoji: "⏸",
    interval: "discontinued / N/A",
    className: "border-gray-200 bg-gray-50 text-gray-500",
  },
}

export const ACTIVE_STAGES: PriceStage[] = [
  "LAUNCH",
  "FRESH",
  "STABLE",
  "MATURE",
]

export const BADGES: Record<
  PriceBadge,
  { label: string; dot: string; className: string }
> = {
  OVERDUE: {
    label: "Overdue",
    dot: "bg-red-500",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  DUE_SOON: {
    label: "Due soon",
    dot: "bg-amber-500",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  FRESH: {
    label: "Fresh",
    dot: "bg-emerald-500",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-gray-400",
    className: "border-gray-200 bg-gray-50 text-gray-500",
  },
}

export const CONFIDENCE: Record<
  ExpectedPriceConfidence,
  { label: string; hint: string; className: string }
> = {
  RUMOUR: {
    label: "Rumour",
    hint: "Leaks only — no launch anywhere yet",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  },
  GLOBAL_LAUNCH: {
    label: "Global launch",
    hint: "Launched abroad (India / global) — price converted",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  BD_TEASER: {
    label: "BD teaser",
    hint: "Brand has announced the BD launch",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
}

export const CURRENCY_SYMBOL: Record<string, string> = {
  BDT: "৳",
  INR: "₹",
  USD: "$",
  CNY: "¥",
  EUR: "€",
}
