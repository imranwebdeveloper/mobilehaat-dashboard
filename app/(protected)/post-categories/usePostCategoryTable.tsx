"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IPostCategory, PostCategoryStatus } from "./post-categories.type"
import { postCategoryApi } from "./post-categories.api"
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

type PostCategoryRow = {
  id: string
  name: string
  slug: string
  description: string
  status: string
  order: number
  post_count: number
  is_featured: boolean
  createdAt: string
}

const mapPostCategoriesToTable = (
  categories: IPostCategory[]
): PostCategoryRow[] => {
  return categories.map((category) => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description || "-",
    status:
      category.status === PostCategoryStatus.ACTIVE ? "Active" : "Inactive",
    order: category.order || 0,
    post_count: category.post_count || 0,
    is_featured: !!category.is_featured,
    createdAt: new Date(category.createdAt).toLocaleDateString(),
  }))
}

export const usePostCategoryTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } =
    postCategoryApi.useGetAllPostCategoryQuery({
      ...query,
    })

  const tableData = useMemo(
    () => mapPostCategoriesToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<PostCategoryRow>[]>(
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
        header: "Category",
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
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-sm text-muted-foreground">
            {row.original.description}
          </div>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },

      {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => <span>{row.original.order}</span>,
      },

      {
        accessorKey: "post_count",
        header: "Posts",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.post_count}</Badge>
        ),
      },

      {
        accessorKey: "is_featured",
        header: "Featured",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.is_featured ? (
              <Badge variant="success">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </div>
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
              {hasPermission(Permissions.POST_CATEGORY_UPDATE) && (
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

              {hasPermission(Permissions.POST_CATEGORY_DELETE) && (
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
