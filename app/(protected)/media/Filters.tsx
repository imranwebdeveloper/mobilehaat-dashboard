"use client"

import { useQueryContext } from "@/hooks/useQueryContext"
import { Search, Trash2, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useMedia } from "./useMedia"
import { useModalContext } from "@/hooks/useModalContext"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"

export function Filters() {
  const { query, setQuery } = useQueryContext()
  const { selectedMedia, clear } = useMedia()
  const { setAction } = useModalContext()

  const selectedCount = selectedMedia.length

  const handleBulkDelete = async () => {
    setAction({
      action: "bulk-delete",
      itemIds: selectedMedia.map((media) => media._id),
      extraState: {
        name: selectedMedia.map((media) => media.name).join(", "),
      },
    })
  }

  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <div className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search media..."
          value={query?.search || ""}
          onChange={(e) =>
            setQuery(
              {
                search: e.target.value,
                searchFields: "name",
              },
              { reset: true }
            )
          }
          className="bg-background pl-9"
        />
      </div>

      {/* Selected Toolbar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-extrabold"
            onClick={clear}
          >
            {selectedCount}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-extrabold"
            onClick={clear}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>

          {/* Bulk Delete */}
          <Permission permission={Permissions.MEDIA_DELETE}>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              Bulk Delete
              <Trash2 className="h-4 w-4" />
            </Button>
          </Permission>
        </div>
      )}
    </div>
  )
}
