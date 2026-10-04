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
  ExternalLinkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"

import { format } from "date-fns"

type PostRow = {
  id: string
  title: string
  slug: string
  category: string
  author: string
  status: string
  type: string
  views: number
  update_status: string
  next_review_at: string
  faq_count: number
  publishedAt: string
  scheduledAt: string
  createdAt: string
  updatedAt: string
}

const formatTableDate = (value?: string | Date | null): string => {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
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
    update_status: post.update_status || "CURRENT",
    next_review_at: formatTableDate(post.next_review_at),
    faq_count: post.faqs?.length || 0,
    publishedAt: formatTableDate(post.published_at),
    scheduledAt:
      post.status === "SCHEDULED"
        ? formatTableDate(post.published_at)
        : "-",
    createdAt: formatTableDate(post.createdAt),
    updatedAt: formatTableDate(post.updatedAt),
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
        accessorKey: "update_status",
        header: "Freshness",
        cell: ({ row }) => (
          <StatusBadge status={row.original.update_status} />
        ),
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
        accessorKey: "publishedAt",
        header: "Published At",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.publishedAt}
          </span>
        ),
      },

      {
        accessorKey: "scheduledAt",
        header: "Scheduled At",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.scheduledAt}
          </span>
        ),
      },

      {
        accessorKey: "next_review_at",
        header: "Next Review",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.next_review_at}
          </span>
        ),
      },

      {
        accessorKey: "faq_count",
        header: "FAQs",
      },

      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.createdAt}
          </span>
        ),
      },

      {
        accessorKey: "updatedAt",
        header: "Last Update",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.updatedAt}
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
              <DropdownMenuItem asChild>
                <a
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3001"}/blog/${row.original.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Public View
                  <ExternalLinkIcon className="ml-auto size-4" />
                </a>
              </DropdownMenuItem>

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
