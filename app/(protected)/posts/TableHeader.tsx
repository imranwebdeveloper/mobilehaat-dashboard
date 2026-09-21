"use client"

import { Input } from "@/components/ui/input"
import { useQueryContext } from "@/hooks/useQueryContext"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"
import React from "react"
import { useRouter } from "next/navigation"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()
  const router = useRouter()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts by title..."
            value={query?.search || ""}
            onChange={(e) =>
              setQuery(
                {
                  searchFields: "title",
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
            value={query?.status || "all"}
            onValueChange={(value) => {
              setQuery({
                status: value === "all" ? undefined : value,
              })
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Permission permission={Permissions.POST_CREATE}>
            <Button onClick={() => router.push("/posts/create")}>
              <Plus className="mr-1 h-5 w-5" /> Add Post
            </Button>
          </Permission>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
