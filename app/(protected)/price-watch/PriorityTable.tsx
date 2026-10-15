"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  History,
  TriangleAlert,
} from "lucide-react"
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
import { BADGES, STAGES } from "./priority.constant"

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
]

const formatDate = (value: string | null) =>
  value ? format(new Date(value), "d MMM yyyy") : "—"

const formatAge = (days: number | null) => {
  if (days === null) return "release date missing"
  if (days < 31) return `${days}d since release`
  if (days < 365) return `${Math.floor(days / 30.44)} mo since release`
  return `${(days / 365).toFixed(1)} yr since release`
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
            {formatDate(row.checkedAt)}
            {row.checkedAtSource === "PHONE_CREATED" && " · created"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span>{formatDate(row.dueAt)}</span>
          <span className="text-xs text-muted-foreground">
            {row.intervalDays ? `every ${row.intervalDays}d` : "no checks"}
          </span>
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
          <span className="tabular-nums">
            {row.approximate_price_bd
              ? `৳${row.approximate_price_bd.toLocaleString()}`
              : "—"}
          </span>
          <Link
            href={`/phones/${row.id}/price-history`}
            className="text-muted-foreground hover:text-primary"
            title="Price history"
          >
            <History className="size-4" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
}

const PriorityTable = ({
  rows,
  paginate,
  isLoading,
  isError,
  onPageChange,
  onLimitChange,
}: {
  rows: PhonePriority[]
  paginate?: IPagination
  isLoading: boolean
  isError: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) => {
  const offset = paginate ? (paginate.current_page - 1) * paginate.per_page : 0

  return (
    <div className="flex flex-col">
      <div className="overflow-auto rounded-lg border bg-background">
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
                    No phones match these filters.
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
