"use client"

import { Input } from "@/components/ui/input"
import { useQueryContext } from "@/hooks/useQueryContext"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts"
            value={query?.search || ""}
            onChange={(e) =>
              setQuery(
                {
                  search: e.target.value,
                },
                { reset: true }
              )
            }
            className="bg-background pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select
            value={query?.status === undefined ? "all" : query?.status}
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({
                  status: undefined,
                })
              } else {
                setQuery({
                  status: value,
                })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              query?.is_read === undefined ? "all" : String(query?.is_read)
            }
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({
                  is_read: undefined,
                })
              } else {
                setQuery({
                  is_read: value === "true",
                })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Read" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Read State</SelectItem>
              <SelectItem value="true">Read</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
