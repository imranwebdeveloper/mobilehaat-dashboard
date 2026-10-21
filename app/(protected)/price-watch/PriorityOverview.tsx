"use client"

import { useState } from "react"
import {
  AlertTriangle,
  BellRing,
  CircleDollarSign,
  Clock,
  FileQuestion,
  Gauge,
  Rocket,
  Sparkles,
  Wrench,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGetPriceWatchPriorityQuery } from "./price-watch.api"
import { PriceStage, PriceTrack, PriorityQuery } from "./price-watch.type"
import { ACTIVE_STAGES, STAGES } from "./priority.constant"
import PriorityFilters from "./PriorityFilters"
import PriorityTable from "./PriorityTable"

const StatCard = ({
  title,
  value,
  hint,
  icon: Icon,
  color,
  onClick,
}: {
  title: string
  value: string | number
  hint?: string
  icon: React.ElementType
  color: string
  onClick?: () => void
}) => (
  <Card
    className={`relative overflow-hidden ${onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}`}
    onClick={onClick}
  >
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const DEFAULT_QUERY: PriorityQuery = { track: "ALL", page: 1, limit: 50 }

const TRACK_TABS: {
  value: PriceTrack | "ALL"
  label: string
  emoji: string
  hint: string
}[] = [
  { value: "ALL", label: "All", emoji: "📱", hint: "Every published phone" },
  {
    value: "PRICE",
    label: "Real price",
    emoji: "💰",
    hint: "Launch, Fresh, Stable and Mature phones with real BD prices",
  },
  {
    value: "UPCOMING",
    label: "Upcoming",
    emoji: "🔮",
    hint: "UPCOMING / NOT_RELEASED phones — expected price, recheck every 14 days",
  },
  {
    value: "FROZEN",
    label: "Frozen",
    emoji: "🧊",
    hint: "2+ years old, DISCONTINUED or N/A — no scheduled checks",
  },
]

const PriorityOverview = () => {
  const [query, setQuery] = useState<PriorityQuery>(DEFAULT_QUERY)
  const { data, isLoading, isFetching, isError } =
    useGetPriceWatchPriorityQuery(query)

  const updateQuery = (patch: Partial<PriorityQuery>) =>
    setQuery((q) => ({ ...q, page: 1, ...patch }))

  const summary = data?.summary
  const price = summary?.price_track

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto">
      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Could not load price priority</AlertTitle>
          <AlertDescription>
            Check that the backend is running and you have phone read access.
          </AlertDescription>
        </Alert>
      )}

      {/* Track tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border bg-background p-1">
        {TRACK_TABS.map((tab) => {
          const active = (query.track ?? "PRICE") === tab.value
          const count =
            tab.value === "ALL"
              ? summary?.total_phones
              : summary?.by_track[tab.value]
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                updateQuery({
                  track: tab.value,
                  stage: undefined,
                  badge: undefined,
                  dueOnly: false,
                  needsData: false,
                })
              }
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition sm:flex-none ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              title={tab.hint}
            >
              <span>{tab.emoji}</span>
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${active ? "bg-primary-foreground/20" : "bg-muted"}`}
              >
                {count ?? 0}
              </span>
              {tab.value === "UPCOMING" && !!summary?.upcoming_due && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white tabular-nums">
                  {summary.upcoming_due} due
                </span>
              )}
              {tab.value === "UPCOMING" &&
                !!summary?.upcoming_track.launch_overdue && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white tabular-nums"
                    title="Expected BD launch date passed"
                  >
                    <BellRing className="size-3" />
                    {summary.upcoming_track.launch_overdue}
                  </span>
                )}
            </button>
          )
        })}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading || !summary || !price ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-27.5 rounded-xl" />
          ))
        ) : query.track === "UPCOMING" ? (
          <>
            <StatCard
              title="Due now"
              value={summary.upcoming_track.due_now}
              hint={`of ${summary.upcoming_track.total} upcoming phones`}
              icon={Clock}
              color="bg-red-500"
              onClick={() => updateQuery({ dueOnly: true, badge: undefined })}
            />
            <StatCard
              title="Launch date passed"
              value={summary.upcoming_track.launch_overdue}
              hint="still UPCOMING — did it launch?"
              icon={BellRing}
              color="bg-orange-500"
            />
            <StatCard
              title="No estimate"
              value={summary.upcoming_track.no_estimate}
              hint="no expected price at all"
              icon={CircleDollarSign}
              color="bg-violet-500"
            />
            <StatCard
              title="No basis yet"
              value={summary.upcoming_track.not_documented}
              hint="price without basis / confidence"
              icon={FileQuestion}
              color="bg-slate-500"
            />
            <StatCard
              title="BD teaser"
              value={summary.upcoming_track.by_confidence.BD_TEASER ?? 0}
              hint="BD launch announced"
              icon={Rocket}
              color="bg-fuchsia-500"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Due now"
              value={price.due_now}
              hint={`of ${price.total} active phones`}
              icon={Clock}
              color="bg-red-500"
              onClick={() =>
                updateQuery({ track: "PRICE", dueOnly: true, badge: undefined })
              }
            />
            <StatCard
              title="Due soon"
              value={price.due_soon}
              hint="within the next few days"
              icon={Sparkles}
              color="bg-amber-500"
              onClick={() =>
                updateQuery({
                  track: "PRICE",
                  dueOnly: false,
                  badge: "DUE_SOON",
                })
              }
            />
            <StatCard
              title="No price"
              value={price.no_price}
              hint="active phones without any price"
              icon={CircleDollarSign}
              color="bg-violet-500"
            />
            <StatCard
              title="Freshness"
              value={`${price.freshness_score}%`}
              hint="active phones within their interval"
              icon={Gauge}
              color={
                price.freshness_score >= 90 ? "bg-emerald-500" : "bg-orange-500"
              }
            />
            <StatCard
              title="Needs data"
              value={summary.needs_data}
              hint="missing release date or BD status"
              icon={Wrench}
              color="bg-slate-500"
              onClick={() =>
                updateQuery({
                  track: "ALL",
                  needsData: true,
                  dueOnly: false,
                  badge: undefined,
                })
              }
            />
          </>
        )}
      </div>

      {/* Due by stage */}
      {price && summary && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Due by stage:
          </span>
          {ACTIVE_STAGES.map((stage: PriceStage) => {
            const s = STAGES[stage]
            const active = query.stage === stage
            return (
              <button
                key={stage}
                type="button"
                onClick={() =>
                  updateQuery({
                    track: "PRICE",
                    stage: active ? undefined : stage,
                  })
                }
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${s.className} ${active ? "ring-2 ring-primary ring-offset-1" : ""}`}
                title={s.interval}
              >
                <span>{s.emoji}</span>
                {s.label}
                <span className="tabular-nums">
                  {price.due_by_stage[stage] ?? 0}
                  <span className="opacity-60">
                    /{summary.by_stage[stage] ?? 0}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      <PriorityFilters
        query={query}
        brands={summary?.brands ?? []}
        onChange={updateQuery}
        onReset={() => setQuery(DEFAULT_QUERY)}
      />

      <PriorityTable
        rows={data?.data ?? []}
        paginate={data?.paginate}
        isLoading={isLoading || isFetching}
        isError={isError}
        search={query.search}
        onSearchChange={(search) =>
          updateQuery({ search: search || undefined })
        }
        onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
        onLimitChange={(limit) => updateQuery({ limit })}
      />
    </div>
  )
}

export default PriorityOverview
