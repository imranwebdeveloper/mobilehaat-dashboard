"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { AuthorStatus, IAuthor } from "./authors.type"
import { authorApi } from "./authors.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVerticalIcon } from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"
import { Badge } from "@/components/ui/badge"

type AuthorRow = {
  id: string
  name: string
  slug: string
  designation: string
  status: string
  post_count: number
  createdAt: string
}

const mapAuthorsToTable = (authors: IAuthor[]): AuthorRow[] => {
  return authors.map((author) => ({
    id: author._id,
    name: author.name,
    slug: author.slug,
    designation: author.designation || "-",
    status: author.status === AuthorStatus.ACTIVE ? "Active" : "Inactive",
    post_count: author.post_count || 0,
    createdAt: new Date(author.createdAt).toLocaleDateString(),
  }))
}

export const useAuthorTable = () => {
  const { query } = useQueryContext()
  const { setAction, resetAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = authorApi.useGetAllAuthorsQuery({
    ...query,
  })

  const tableData = useMemo(() => mapAuthorsToTable(data?.data || []), [data])

  const columns = useMemo<ColumnDef<AuthorRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },

      {
        accessorKey: "name",
        header: "Author",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.slug}
            </div>
          </div>
        ),
      },

      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-sm text-muted-foreground">
            {row.original.designation}
          </div>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },

      {
        accessorKey: "post_count",
        header: "Posts",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.post_count}</Badge>
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.createdAt}
          </span>
        ),
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {hasPermission(Permissions.AUTHOR_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "edit",
                      itemId: row.original.id,
                    })
                  }
                >
                  Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.AUTHOR_DELETE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { name: row.original.name },
                    })
                  }
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [setAction, hasPermission]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  })

  return {
    table,
    columns,
    tableData,
    paginate: data?.paginate,
    isLoading,
    isError,
  }
}
