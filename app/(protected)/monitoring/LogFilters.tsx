"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { LogQuery } from "./monitoring.type"

const eventTypes = [
  { value: "all", label: "All Events" },
  { value: "error", label: "Errors" },
  { value: "security", label: "Security" },
  { value: "audit", label: "Audit" },
  { value: "http_request", label: "Requests" },
]

const LogFilters = ({
  eventType,
  onEventTypeChange,
  query,
  onQueryChange,
}: {
  eventType: string
  onEventTypeChange: (v: string) => void
  query: LogQuery
  onQueryChange: (q: Partial<LogQuery>) => void
}) => {
  const [search, setSearch] = useState(query?.search || "")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleSearch = (value: string) => {
    setSearch(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onQueryChange({ search: value || undefined, page: 1 })
    }, 300)
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-background pl-9"
        />
      </div>

      <Select value={eventType} onValueChange={(v) => { onEventTypeChange(v); onQueryChange({ page: 1 }) }}>
        <SelectTrigger className="w-36 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {eventTypes.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query?.level === undefined ? "all" : String(query?.level)}
        onValueChange={(v) => onQueryChange({ level: v === "all" ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-32 bg-background">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="warn">Warning</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={query?.method === undefined ? "all" : String(query?.method)}
        onValueChange={(v) => onQueryChange({ method: v === "all" ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-32 bg-background">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PATCH">PATCH</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={String(query?.limit || 50)}
        onValueChange={(v) => onQueryChange({ limit: Number(v), page: 1 })}
      >
        <SelectTrigger className="w-28 bg-background">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default LogFilters

