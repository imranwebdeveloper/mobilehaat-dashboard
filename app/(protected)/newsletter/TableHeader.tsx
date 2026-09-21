"use client"

import { useQueryContext } from "@/hooks/useQueryContext"
import { Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useModalContext } from "@/hooks/useModalContext"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()
  const { setAction, itemIds, action, extraState } = useModalContext()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email"
            value={query?.search || ""}
            onChange={(e) =>
              setQuery(
                {
                  searchFields: "email",
                  search: e.target.value,
                },
                { reset: true }
              )
            }
            className="bg-background pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {action === "letter" && (
            <Permission permission={Permissions.NEWSLETTER_DELETE}>
              <Button
                className=""
                variant={"destructive"}
                onClick={() => {
                  setAction({
                    action: "bulk-delete",
                    itemIds: itemIds,
                    extraState: {
                      email: extraState.email,
                    },
                  })
                }}
              >
                <Trash2 className="h-3 w-3" />
                <span>Bulk Delete ({itemIds.length})</span>
              </Button>
            </Permission>
          )}

          <Select
            value={
              query?.is_active === undefined ? "all" : String(query?.is_active)
            }
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({
                  is_active: undefined,
                })
              } else {
                setQuery({
                  is_active: value === "true",
                })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
