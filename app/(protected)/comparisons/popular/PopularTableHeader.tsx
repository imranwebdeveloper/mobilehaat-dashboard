"use client"

import { useQueryContext } from "@/hooks/useQueryContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PopularTableHeader = () => {
  const { setQuery, query } = useQueryContext()

  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Ranked by total comparison count
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show</span>
        <Select
          value={String(query?.limit || 10)}
          onValueChange={(value) => setQuery({ limit: Number(value) })}
        >
          <SelectTrigger className="w-20 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default PopularTableHeader
