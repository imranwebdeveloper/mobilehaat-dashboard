import { clsx, type ClassValue } from "clsx"
import { ChangeEvent } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(value?: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleString()
}

export function formatDate(value?: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

export function formatPeriod(period?: string): string {
  if (!period) return "N/A"
  return period.replace(/_/g, " ").toLowerCase()
}

export const handleNumberInput =
  (onChange: (value: number) => void) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onChange(value === "" ? Number.NaN : Number(value))
  }
