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
import { useModalContext } from "@/hooks/useModalContext"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"
import React from "react"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()
  const { setAction } = useModalContext()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name"
            value={query?.search || ""}
            onChange={(e) =>
              setQuery(
                {
                  searchFields: "name",
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
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Permission permission={Permissions.POST_CATEGORY_CREATE}>
            <Button onClick={() => setAction({ action: "create" })}>
              <Plus className="h-5 w-5" /> Add Category
            </Button>
          </Permission>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
