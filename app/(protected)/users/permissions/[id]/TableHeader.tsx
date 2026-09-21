"use client"

import { Input } from "@/components/ui/input"
import { useQueryContext } from "@/hooks/useQueryContext"
import { Search } from "lucide-react"

export const TableHeader = () => {
  const { setQuery, query } = useQueryContext()

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by resource"
            value={query?.search || ""}
            onChange={(e) =>
              setQuery(
                {
                  searchFields: "resource",
                  search: e.target.value,
                },
                { reset: true }
              )
            }
            className="bg-background pl-9"
          />
        </div>
      </div>
    </div>
  )
}

export default TableHeader
