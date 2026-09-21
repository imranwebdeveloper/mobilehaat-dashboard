"use client"

import { useEffect, useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { INewsletter } from "./newsletter.type"
import { newsletterApi } from "./newsletter.api"
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

type NewsletterRow = {
  id: string
  email: string
  is_active: string
  unsubscribed_at: string
  createdAt: string
}

const mapNewslettersToTable = (newsletters: INewsletter[]): NewsletterRow[] => {
  return newsletters.map((newsletter) => ({
    id: newsletter._id,
    email: newsletter.email,
    is_active: newsletter.is_active ? "Active" : "Inactive",
    unsubscribed_at: newsletter.unsubscribed_at
      ? new Date(newsletter.unsubscribed_at).toLocaleDateString()
      : "-",
    createdAt: new Date(newsletter.createdAt).toLocaleDateString(),
  }))
}

export const useNewsletterTable = () => {
  const { query } = useQueryContext()
  const { setAction, resetAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = newsletterApi.useGetAllNewsletterQuery({
    ...query,
  })

  const tableData = useMemo(
    () => mapNewslettersToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<NewsletterRow>[]>(
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
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.email}</div>
        ),
      },

      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.is_active} />,
      },

      {
        accessorKey: "unsubscribed_at",
        header: "Unsubscribed At",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.unsubscribed_at}
          </span>
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Subscribed At",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
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
              {hasPermission(Permissions.NEWSLETTER_DELETE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { email: row.original.email },
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

  const selectedRows = table.getSelectedRowModel().rows

  const selectedIds = useMemo(
    () => selectedRows.map((r) => r.original.id),
    [selectedRows]
  )

  const selectedEmails = useMemo(
    () => selectedRows.map((r) => r.original.email).join(", "),
    [selectedRows]
  )

  useEffect(() => {
    if (selectedIds.length) {
      setAction({
        action: "letter",
        itemIds: selectedIds,
        extraState: { email: selectedEmails },
      })
    } else {
      resetAction()
    }
  }, [selectedIds, selectedEmails])

  return {
    table,
    columns,
    tableData,
    paginate: data?.paginate,
    isLoading,
    isError,
  }
}
