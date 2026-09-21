"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"

import { IPost } from "./posts.type"
import { postApi } from "./posts.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"

type PostRow = {
  id: string
  title: string
  slug: string
  category: string
  author: string
  status: string
  type: string
  views: number
  createdAt: string
}

const mapPostsToTable = (posts: IPost[]): PostRow[] => {
  return posts.map((post) => ({
    id: post._id,
    title: post.title,
    slug: post.slug,
    category: post.category?.name || "-",
    author: post.author?.name || "-",
    status: post.status,
    type: post.type,
    views: post.view_count,
    createdAt: new Date(post.createdAt).toLocaleDateString(),
  }))
}

export const usePostTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()
  const router = useRouter()

  const { data, isLoading, isError } = postApi.useGetAllPostsQuery({
    ...query,
  })

  const tableData = useMemo(() => mapPostsToTable(data?.data || []), [data])

  const columns = useMemo<ColumnDef<PostRow>[]>(
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
        accessorKey: "title",
        header: "Post",
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.slug}
            </div>
          </div>
        ),
      },

      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.category}</Badge>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },

      {
        accessorKey: "views",
        header: "Views",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <EyeIcon className="h-4 w-4" />
            {row.original.views}
          </div>
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Created At",
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
              {hasPermission(Permissions.POST_UPDATE) && (
                <DropdownMenuItem
                  onClick={() => router.push(`/posts/${row.original.id}/edit`)}
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.POST_DELETE) && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { name: row.original.title },
                    })
                  }
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [setAction, hasPermission, router]
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
