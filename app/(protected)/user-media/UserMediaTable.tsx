"use client"

import { useState } from "react"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { useDebounce } from "@/hooks/useDebounce"
import { useGetAllUserMediaQuery, useBulkDeleteUserMediaMutation } from "./user-media.api"
import { USER_MEDIA_PURPOSE_OPTIONS } from "./user-media.type"
import type { UserMediaPurpose } from "./user-media.type"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Search, Trash2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { CustomPagination } from "@/components/CustomPagination"

const getPurposeColor = (purpose: UserMediaPurpose) => {
  const colors: Record<string, string> = {
    GENERAL: "bg-slate-100 text-slate-700",
    PROFILE: "bg-blue-100 text-blue-700",
    SELLER_LOGO: "bg-indigo-100 text-indigo-700",
    SELLER_COVER: "bg-purple-100 text-purple-700",
    SELLER_BANNER: "bg-pink-100 text-pink-700",
    SELLER_ATTACHMENT: "bg-amber-100 text-amber-700",
  }
  return colors[purpose] || "bg-slate-100 text-slate-700"
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export default function UserMediaTable() {
  const { query, setQuery } = useQueryContext()
  const { setAction } = useModalContext()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState(query.search || "")
  const debouncedSearch = useDebounce(search, 400)

  const purposeFilter = (query.purpose as string) || ""

  const { data, isLoading } = useGetAllUserMediaQuery({
    page: query.page || 1,
    limit: query.limit || 12,
    search: debouncedSearch,
    purpose: purposeFilter || undefined,
  })

  const [bulkDelete, { isLoading: isBulkDeleting }] =
    useBulkDeleteUserMediaMutation()

  const items = data?.data || []
  const paginate = data?.paginate

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((item) => item._id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    await bulkDelete({ ids: selectedIds })
    setSelectedIds([])
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select
          value={purposeFilter}
          onValueChange={(v) => setQuery({ ...query, purpose: v === "all" ? "" : v, page: 1 })}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All purposes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All purposes</SelectItem>
            {USER_MEDIA_PURPOSE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setAction({ action: "bulk-delete", itemIds: selectedIds })}
            disabled={isBulkDeleting}
          >
            {isBulkDeleting ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <Trash2 className="mr-1 size-3" />
            )}
            Delete ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    items.length > 0 && selectedIds.length === items.length
                      ? true
                      : selectedIds.length > 0
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-16">Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No media found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item._id)}
                      onCheckedChange={() => toggleSelect(item._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
                      {item.url ? (
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <ImageIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getPurposeColor(item.purpose)}
                    >
                      {item.purpose.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {typeof item.user_id === "object"
                        ? item.user_id.email || item.user_id._id
                        : item.user_id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(item.size)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {item.mime_type.split("/")[1]?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setAction({ action: "delete", itemId: item._id })
                      }
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginate && <CustomPagination paginate={paginate} />}
    </div>
  )
}
