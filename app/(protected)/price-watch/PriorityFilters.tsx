"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { PriceBadge, PriceStage, PriorityQuery } from "./price-watch.type"
import { BADGES, STAGES } from "./priority.constant"

const ALL = "all"

const PriorityFilters = ({
  query,
  brands,
  onChange,
  onReset,
}: {
  query: PriorityQuery
  brands: { id: string; name: string; total: number; due: number }[]
  onChange: (patch: Partial<PriorityQuery>) => void
  onReset: () => void
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <Select
        value={query.stage ?? ALL}
        onValueChange={(v) =>
          onChange({ stage: v === ALL ? undefined : (v as PriceStage) })
        }
      >
        <SelectTrigger className="w-40 bg-background">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All stages</SelectItem>
          {(Object.keys(STAGES) as PriceStage[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STAGES[s].emoji} {STAGES[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.badge ?? ALL}
        onValueChange={(v) =>
          onChange({ badge: v === ALL ? undefined : (v as PriceBadge) })
        }
      >
        <SelectTrigger className="w-36 bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {(Object.keys(BADGES) as PriceBadge[]).map((b) => (
            <SelectItem key={b} value={b}>
              {BADGES[b].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.brand ?? ALL}
        onValueChange={(v) => onChange({ brand: v === ALL ? undefined : v })}
      >
        <SelectTrigger className="w-48 bg-background">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All brands</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
              <span className="ml-1 text-muted-foreground">
                ({b.due} due / {b.total})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="due-only"
          checked={!!query.dueOnly}
          onCheckedChange={(checked) => onChange({ dueOnly: checked })}
        />
        <Label htmlFor="due-only">Due only</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="needs-data"
          checked={!!query.needsData}
          onCheckedChange={(checked) => onChange({ needsData: checked })}
        />
        <Label htmlFor="needs-data">Needs data</Label>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="md:ml-auto"
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  )
}

export default PriorityFilters
