"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type LogRow = Record<string, unknown>

export const levelVariant = (level: string): "destructive" | "secondary" | "default" | "outline" => {
  switch (level?.toLowerCase()) {
    case "error":
      return "destructive"
    case "warn":
    case "warning":
      return "secondary"
    case "info":
      return "default"
    default:
      return "outline"
  }
}

const statusCodeVariant = (code: number): "destructive" | "secondary" | "default" | "success" => {
  if (code >= 500) return "destructive"
  if (code >= 400) return "secondary"
  if (code >= 200 && code < 300) return "success"
  return "default"
}

const formatDuration = (ms: unknown): string => {
  const num = Number(ms)
  if (isNaN(num)) return "N/A"
  if (num < 1000) return `${num}ms`
  return `${(num / 1000).toFixed(1)}s`
}

const TimestampCell = ({ value }: { value: unknown }) => {
  const dateStr = String(value || "")
  if (!dateStr) return <span className="text-muted-foreground">N/A</span>
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return <span className="text-muted-foreground">Invalid</span>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default text-xs">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{date.toLocaleString()}</p>
      </TooltipContent>
    </Tooltip>
  )
}

const MessageCell = ({ value }: { value: unknown }) => {
  const msg = String(value || "N/A")
  return (
    <span className="max-w-xs truncate text-xs" title={msg}>
      {msg}
    </span>
  )
}

const PathCell = ({ value }: { value: unknown }) => {
  const path = String(value || "N/A")
  return (
    <span className="max-w-xs truncate font-mono text-xs" title={path}>
      {path}
    </span>
  )
}

export const typeVariant = (type: string): "destructive" | "secondary" | "default" | "outline" => {
  switch (type) {
    case "error": return "destructive"
    case "security": return "secondary"
    case "audit": return "outline"
    case "request": return "default"
    default: return "outline"
  }
}

export const allLogsColumns: ColumnDef<LogRow, unknown>[] = [
  {
    header: "Type",
    accessorKey: "_type",
    cell: ({ row }) => {
      const type = String(row.original._type || "")
      return (
        <Badge variant={typeVariant(type)} className="capitalize text-xs">
          {type}
        </Badge>
      )
    },
  },
  {
    header: "Time",
    accessorKey: "timestamp",
    cell: ({ row }) => <TimestampCell value={row.original.timestamp} />,
  },
  {
    header: "Level",
    accessorKey: "level",
    cell: ({ row }) => {
      const level = String(row.original.level || "")
      return (
        <Badge variant={levelVariant(level)} className="capitalize">
          {level}
        </Badge>
      )
    },
  },
  {
    header: "Event",
    accessorKey: "event",
    cell: ({ row }) => (
      <span className="text-xs">{String(row.original.event || "N/A")}</span>
    ),
  },
  {
    header: "Message",
    accessorKey: "message",
    cell: ({ row }) => <MessageCell value={row.original.message} />,
  },
  {
    header: "Method",
    accessorKey: "method",
    cell: ({ row }) => {
      const method = String(row.original.method || "")
      if (!method) return <span className="text-muted-foreground">—</span>
      const methodVariant = method === "GET" ? "outline" : method === "DELETE" ? "destructive" : "default"
      return (
        <Badge variant={methodVariant} className="font-mono text-xs">
          {method}
        </Badge>
      )
    },
  },
  {
    header: "Path",
    accessorKey: "path",
    cell: ({ row }) => <PathCell value={row.original.path} />,
  },
  {
    header: "Status",
    accessorKey: "statusCode",
    cell: ({ row }) => {
      const code = Number(row.original.statusCode)
      if (!code) return <span className="text-muted-foreground">—</span>
      return (
        <Badge variant={statusCodeVariant(code)} className="font-mono text-xs">
          {code}
        </Badge>
      )
    },
  },
  {
    header: "Duration",
    accessorKey: "durationMs",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{formatDuration(row.original.durationMs)}</span>
    ),
  },
  {
    header: "Request ID",
    accessorKey: "requestId",
    cell: ({ row }) => {
      const id = String(row.original.requestId || "")
      if (!id) return <span className="text-muted-foreground">—</span>
      const short = id.length > 8 ? id.slice(0, 8) + "…" : id
      return (
        <span className="font-mono text-xs" title={id}>
          {short}
        </span>
      )
    },
  },
  {
    header: "User ID",
    accessorKey: "userId",
    cell: ({ row }) => {
      const id = String(row.original.userId || "")
      if (!id) return <span className="text-muted-foreground">—</span>
      const short = id.length > 8 ? id.slice(0, 8) + "…" : id
      return (
        <span className="font-mono text-xs" title={id}>
          {short}
        </span>
      )
    },
  },
]
