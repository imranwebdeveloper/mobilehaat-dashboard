"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IPostComment } from "./post-comments.type"
import { postCommentApi } from "./post-comments.api"
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

import {
  EllipsisVerticalIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"
import { toast } from "sonner"

type CommentRow = {
  id: string
  post: string
  user: string
  content: string
  status: string
  createdAt: string
}

const mapCommentsToTable = (comments: IPostComment[]): CommentRow[] => {
  return comments.map((comment) => ({
    id: comment._id,
    post: comment.post_data?.title || "Unknown Post",
    user: `${comment.user?.first_name} ${comment.user?.last_name}`,
    content: comment.content,
    status: comment.status,
    createdAt: new Date(comment.createdAt).toLocaleDateString(),
  }))
}

export const usePostCommentTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const [moderateComment] = postCommentApi.useModeratePostCommentMutation()

  const { data, isLoading, isError } =
    postCommentApi.useGetAllPostCommentsQuery({
      ...query,
    })

  const tableData = useMemo(() => mapCommentsToTable(data?.data || []), [data])

  const handleModerate = async (id: string, status: string) => {
    try {
      await moderateComment({ id, status }).unwrap()
      toast.success(`Comment ${status.toLowerCase()} successfully`)
    } catch {
      toast.error("Failed to moderate comment")
    }
  }

  const columns = useMemo<ColumnDef<CommentRow>[]>(
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
        accessorKey: "user",
        header: "User",
      },
      {
        accessorKey: "post",
        header: "Post",
      },
      {
        accessorKey: "content",
        header: "Comment",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate" title={row.original.content}>
            {row.original.content}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
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
              {hasPermission(Permissions.POST_COMMENT_MODERATE) && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleModerate(row.original.id, "APPROVED")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModerate(row.original.id, "REJECTED")}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModerate(row.original.id, "SPAM")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                    Mark as Spam
                  </DropdownMenuItem>
                </>
              )}

              {hasPermission(Permissions.POST_COMMENT_DELETE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { name: "this comment" },
                    })
                  }
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [setAction, hasPermission, moderateComment]
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
