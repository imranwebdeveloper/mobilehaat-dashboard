"use client"

import { Input } from "@/components/ui/input"
import { useQueryContext } from "@/hooks/useQueryContext"
import { Plus, Search, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import AsyncRoleSelect from "@/components/common/select/AsyncRoleSelect"
import { useModalContext } from "@/hooks/useModalContext"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()
  const { setAction, itemIds, action, extraState } = useModalContext()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
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
            <Permission permission={Permissions.USER_DELETE}>
              <Button
                className=""
                variant={"destructive"}
                onClick={() => {
                  setAction({
                    action: "bulk-delete",
                    itemIds: itemIds,
                    extraState: {
                      name: extraState.name,
                    },
                  })
                }}
              >
                <Trash2 className="h-3 w-3" />
                <span>Bulk Delete ({itemIds.length})</span>
              </Button>
            </Permission>
          )}

          <AsyncRoleSelect
            value={query?.role === undefined ? "all" : query?.role || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({
                  role: undefined,
                })
              } else {
                setQuery({
                  role: value,
                })
              }
            }}
            showAll
            placeholder="Filter by role"
          />

          <Select
            value={
              query?.is_active === undefined
                ? "all"
                : query?.is_active
                  ? "Active"
                  : "Inactive"
            }
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({
                  is_active: undefined,
                })
              } else {
                setQuery({
                  is_active: value === "Active" ? true : false,
                })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Permission permission={Permissions.USER_CREATE}>
            <Button onClick={() => setAction({ action: "create" })}>
              <Plus className="h-5 w-5" /> Add User
            </Button>
          </Permission>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
