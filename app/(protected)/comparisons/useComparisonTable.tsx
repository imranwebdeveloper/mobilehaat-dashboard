"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IComparison, ComparisonStatus } from "./comparisons.type"
import { comparisonsApi } from "./comparisons.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"
import { useRouter } from "next/navigation"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVerticalIcon, ExternalLinkIcon } from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"

type ComparisonRow = {
  id: string
  title: string
  slug: string
  status: string
  phone_count: number
  createdAt: string
}

const mapComparisonsToTable = (comparisons: IComparison[]): ComparisonRow[] => {
  return comparisons.map((comparison) => ({
    id: comparison._id!,
    title: comparison.title,
    slug: comparison.slug,
    status: comparison.status,
    phone_count: comparison.phones?.length || 0,
    createdAt: comparison.createdAt
      ? new Date(comparison.createdAt).toLocaleDateString()
      : "N/A",
  }))
}

export const useComparisonTable = () => {
  const router = useRouter()
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = comparisonsApi.useGetAllComparisonsQuery(
    {
      ...query,
    }
  )

  const tableData = useMemo(
    () => mapComparisonsToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<ComparisonRow>[]>(
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
        header: "Title",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "phone_count",
        header: "Phones",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.phone_count}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.createdAt}
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
              <DropdownMenuItem asChild>
                <a
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3001"}/compare-list/${row.original.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on site
                  <ExternalLinkIcon className="ml-auto size-4" />
                </a>
              </DropdownMenuItem>

              {hasPermission(Permissions.COMPARISON_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/comparisons/${row.original.id}/edit`)
                  }
                >
                  Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.COMPARISON_DELETE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { title: row.original.title },
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
