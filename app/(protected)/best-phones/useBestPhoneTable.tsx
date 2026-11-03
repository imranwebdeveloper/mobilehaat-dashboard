"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IBestPhone, BestPhoneStatus } from "./best-phones.type"
import { bestPhoneApi } from "./best-phones.api"
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

import { format } from "date-fns"

import StatusBadge from "@/components/common/StatusBadge"

type BestPhoneRow = {
  id: string
  title: string
  slug: string
  min_price: number
  max_price: number
  status: string
  phone_count: number
  views: number
  last_reviewed: string
  createdAt: string
  updatedAt: string
}

const formatTableDate = (value?: string | Date | null): string => {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
}

const mapBestPhonesToTable = (bestPhones: IBestPhone[]): BestPhoneRow[] => {
  return bestPhones.map((bestPhone) => {
    return {
      id: bestPhone._id!,
      title: bestPhone.title,
      slug: bestPhone.slug,
      min_price: bestPhone.min_price || 0,
      max_price: bestPhone.max_price || 0,
      status:
        bestPhone.status === BestPhoneStatus.ACTIVE ? "Active" : "Inactive",
      phone_count: bestPhone.rankings?.length || 0,
      views: bestPhone.views_count ?? 0,
      last_reviewed: formatTableDate(bestPhone.last_reviewed_at),
      createdAt: new Date(bestPhone.createdAt!).toLocaleDateString(),
      updatedAt: formatTableDate(bestPhone.updatedAt),
    }
  })
}

export const useBestPhoneTable = () => {
  const router = useRouter()
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = bestPhoneApi.useGetAllBestPhoneQuery({
    ...query,
  })

  const tableData = useMemo(
    () => mapBestPhonesToTable(data?.data || []),
    [data]
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const columns = useMemo<ColumnDef<BestPhoneRow>[]>(
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
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "min_price",
        header: "Min Price",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {formatPrice(row.original.min_price)}
          </div>
        ),
      },
      {
        accessorKey: "max_price",
        header: "Max Price",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {formatPrice(row.original.max_price)}
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
        accessorKey: "views",
        header: "Total Views",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {(row.original.views ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "last_reviewed",
        header: "Last Reviewed",
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            {row.original.last_reviewed}
          </div>
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
        accessorKey: "updatedAt",
        header: "Last Update",
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            {row.original.updatedAt}
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
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3001"}/best-phone/${row.original.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Public View
                  <ExternalLinkIcon className="ml-auto size-4" />
                </a>
              </DropdownMenuItem>

              {hasPermission(Permissions.BEST_PHONE_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/best-phones/${row.original.id}/edit`)
                  }
                >
                  Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.BEST_PHONE_DELETE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { name: row.original.title },
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
