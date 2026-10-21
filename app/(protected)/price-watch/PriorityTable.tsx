"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  Flame,
  History,
  Rocket,
  Search,
  TriangleAlert,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IPagination } from "@/store/global.type"
import { PhonePriority } from "./price-watch.type"
import { BADGES, CONFIDENCE, STAGES } from "./priority.constant"
import PriorityActions from "./PriorityActions"

const COLUMNS = [
  "#",
  "Phone",
  "Stage",
  "Last checked",
  "Next due",
  "Overdue",
  "Priority",
  "Status",
  "Price",
  "Actions",
]

const formatDate = (value: string | null) =>
  value ? format(new Date(value), "d MMM yyyy") : "—"

const formatAge = (days: number | null) => {
  if (days === null) return "release date missing"
  if (days < 31) return `${days}d since release`
  if (days < 365) return `${Math.floor(days / 30.44)} mo since release`
  return `${(days / 365).toFixed(1)} yr since release`
}

/** How the last check happened, e.g. "confirmed" or "not found ×2". */
const checkLabel = (row: PhonePriority) => {
  if (row.checkedAtSource === "PHONE_CREATED") return "created"
  if (row.checkedAtSource === "PRICE_HISTORY") return "price saved"
  switch (row.lastAction) {
    case "CONFIRMED":
      return "✓ confirmed"
    case "NOT_FOUND":
      return `not found ×${row.missCount}`
    case "SAVED_UNCHANGED":
      return "saved, unchanged"
    default:
      return "price updated"
  }
}

const PriorityRow = ({ row, rank }: { row: PhonePriority; rank: number }) => {
  const stage = STAGES[row.stage]
  const badge = BADGES[row.badge]

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-10 text-muted-foreground tabular-nums">
        {rank}
      </TableCell>

      <TableCell className="min-w-[220px]">
        <div className="flex flex-col">
          <Link
            href={`/phones/${row.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.title}
          </Link>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {row.brand?.name ?? "No brand"}
            {row.trafficBoost > 1 && (
              <span className="inline-flex items-center gap-0.5 text-orange-600">
                <Flame className="size-3" /> top traffic
              </span>
            )}
            {row.needsData && (
              <span className="inline-flex items-center gap-0.5 text-amber-600">
                <TriangleAlert className="size-3" /> needs data
              </span>
            )}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${stage.className}`}
            >
              {stage.emoji} {stage.label}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {stage.interval} · {formatAge(row.ageDays)}
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="tabular-nums">
            {Math.floor(row.daysSinceCheck)}d ago
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(row.checkedAt)} · {checkLabel(row)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span>{formatDate(row.dueAt)}</span>
          <span className="text-xs text-muted-foreground">
            {row.intervalDays ? `every ${row.intervalDays}d` : "no checks"}
          </span>
          {row.expected?.launch_bd && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${row.launchOverdue ? "font-medium text-red-600" : "text-fuchsia-700"}`}
              title={
                row.launchOverdue
                  ? "Expected BD launch date has passed — did it launch?"
                  : "Expected BD launch"
              }
            >
              {row.launchOverdue ? (
                <BellRing className="size-3" />
              ) : (
                <Rocket className="size-3" />
              )}
              BD {formatDate(row.expected.launch_bd)}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="tabular-nums">
        {row.intervalDays ? `${row.overdue.toFixed(2)}×` : "—"}
      </TableCell>

      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-semibold tabular-nums">
              {row.noPrice ? "No price" : row.priority.toFixed(2)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {row.overdue.toFixed(2)} overdue × {row.weight} weight ×{" "}
            {row.trafficBoost} traffic
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          <span className={`size-1.5 rounded-full ${badge.dot}`} />
          {row.noPrice ? "No price" : badge.label}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="tabular-nums">
              {row.approximate_price_bd
                ? `${row.track === "UPCOMING" ? "~" : ""}৳${row.approximate_price_bd.toLocaleString()}`
                : "—"}
            </span>
            {row.track === "UPCOMING" &&
              (row.expected ? (
                <span
                  className={`mt-0.5 w-fit rounded-full border px-2 py-px text-[11px] font-medium ${CONFIDENCE[row.expected.confidence].className}`}
                  title={
                    row.expected.basis ||
                    CONFIDENCE[row.expected.confidence].hint
                  }
                >
                  {CONFIDENCE[row.expected.confidence].label}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  no basis yet
                </span>
              ))}
            {row.track !== "UPCOMING" && row.expected && (
              <span
                className="text-[11px] text-muted-foreground"
                title="Expected price before the BD launch"
              >
                expected ৳{row.expected.price.toLocaleString()}
              </span>
            )}
          </div>
          <Link
            href={`/phones/${row.id}/price-history`}
            className="text-muted-foreground hover:text-primary"
            title="Price history"
          >
            <History className="size-4" />
          </Link>
        </div>
      </TableCell>

      <TableCell>
        <PriorityActions row={row} />
      </TableCell>
    </TableRow>
  )
}

/** Search box in the table header; waits 300 ms after typing before querying. */
const PrioritySearch = ({
  value,
  total,
  onChange,
}: {
  value?: string
  total?: number
  onChange: (value: string) => void
}) => {
  const [text, setText] = useState(value ?? "")
  const debounced = useDebounce(text, 300)

  // Follow outside changes (e.g. the Reset button clears the search).
  useEffect(() => {
    setText(value ?? "")
  }, [value])

  useEffect(() => {
    if (debounced.trim() !== (value ?? "")) onChange(debounced.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="flex items-center gap-3 border-b bg-background px-3 py-2">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search phone — e.g. redmi note 17"
          aria-label="Search phones"
          maxLength={100}
          className="h-9 pr-8 pl-8"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {total !== undefined && (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {total.toLocaleString()} {total === 1 ? "phone" : "phones"}
        </span>
      )}
    </div>
  )
}

const PriorityTable = ({
  rows,
  paginate,
  isLoading,
  isError,
  search,
  onSearchChange,
  onPageChange,
  onLimitChange,
}: {
  rows: PhonePriority[]
  paginate?: IPagination
  isLoading: boolean
  isError: boolean
  search?: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) => {
  const offset = paginate ? (paginate.current_page - 1) * paginate.per_page : 0

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-lg border bg-background">
        <PrioritySearch
          value={search}
          total={paginate?.total}
          onChange={onSearchChange}
        />
        <div className="overflow-auto">
          <TooltipProvider>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  {COLUMNS.map((c) => (
                    <TableHead key={c} className="bg-secondary">
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={COLUMNS.length}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Failed to load phones.
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {search
                        ? `No phones match "${search}" with these filters.`
                        : "No phones match these filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, i) => (
                    <PriorityRow key={row.id} row={row} rank={offset + i + 1} />
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </div>
      <PriorityPagination
        paginate={paginate}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  )
}

const PAGE_SIZES = [25, 50, 100, 200]

/** Always visible (the shared CustomPagination hides itself on a single page). */
const PriorityPagination = ({
  paginate,
  onPageChange,
  onLimitChange,
}: {
  paginate?: IPagination
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) => {
  if (!paginate) return null
  const { current_page, per_page, total, total_pages } = paginate
  const start = total === 0 ? 0 : (current_page - 1) * per_page + 1
  const end = Math.min(current_page * per_page, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> phones
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Rows per page
          <Select
            value={String(per_page)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-20 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={current_page <= 1}
            onClick={() => onPageChange(current_page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm tabular-nums">
            Page {current_page} of {Math.max(total_pages, 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={current_page >= total_pages}
            onClick={() => onPageChange(current_page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PriorityTable
