"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IPhone } from "./phones.type"
import { useGetAllPhoneQuery, useDeletePhoneMutation } from "./phones.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import { EllipsisVerticalIcon } from "lucide-react"
import StatusBadge from "@/components/common/StatusBadge"
import { toast } from "sonner"
import { formatBDT } from "@/lib/utils"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useModalContext } from "@/hooks/useModalContext"

type PhoneRow = {
  id: string
  title: string
  model: string
  price: string
  rating: string
  views: number
  announced: string
  status: string
  createdAt: string
  bd_status?: string
}

const getVariantPriceDisplay = (phone: IPhone): string => {
  const variants = phone.variants || []
  if (variants.length === 0) return formatBDT(phone?.approximate_price_bd || 0)

  const prices = variants
    .map((v) => v.official_price || v.unofficial_price || 0)
    .filter((p) => p > 0)

  if (prices.length === 0) return formatBDT(phone?.approximate_price_bd || 0)

  const min = Math.min(...prices)
  const max = Math.max(...prices)

  if (min === max) return formatBDT(min)
  return `${formatBDT(min)} - ${formatBDT(max)}`
}

const formatTableDate = (value?: string | Date | null): string => {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
}

const mapPhonesToTable = (phones: IPhone[]): PhoneRow[] => {
  return phones.map((phone) => {
    const priceDisplay = getVariantPriceDisplay(phone)

    return {
      id: phone._id,
      title: phone.title,
      model: phone.model,
      price: priceDisplay,
      rating: phone.expert_rating ? phone.expert_rating.toFixed(1) : "-",
      views: phone.views ?? 0,
      announced: formatTableDate(phone.announced),
      status: phone.status,
      createdAt: formatTableDate(phone.createdAt),
      bd_status: phone.bd_status,
    }
  })
}

export const usePhoneTable = () => {
  const { query } = useQueryContext()
  const { hasPermission } = usePermission()
  const [deletePhone] = useDeletePhoneMutation()
  const router = useRouter()
  const { setAction } = useModalContext()

  const [priceUpdatePhoneId, setPriceUpdatePhoneId] = useState<string | null>(
    null
  )

  const { data, isLoading, isError } = useGetAllPhoneQuery({
    ...query,
  })
  const tableData = useMemo(() => mapPhonesToTable(data?.data || []), [data])
  const phones = data?.data || []

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deletePhone(id).unwrap()
        toast.success("Phone deleted successfully")
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        toast.error(err?.data?.message || "Delete failed")
      }
    }
  }

  const priceUpdatePhone =
    phones.find((p) => p._id === priceUpdatePhoneId) || null

  const columns = useMemo<ColumnDef<PhoneRow>[]>(
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
        header: "Phone",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.model}
            </div>
          </div>
        ),
      },

      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.price}</div>
        ),
      },

      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.rating}</span>
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
        accessorKey: "announced",
        header: "Announcement",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.announced}
          </span>
        ),
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "bd_status",
        header: "BD Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.bd_status as string} />
        ),
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`/phones/${row.original.id}`)
                  }}
                >
                  View
                </DropdownMenuItem>

                {hasPermission(Permissions.PHONE_READ) && (
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/phones/${row.original.id}/price-history`)
                    }}
                  >
                    Price History
                  </DropdownMenuItem>
                )}

                {hasPermission(Permissions.PHONE_UPDATE) && (
                  <DropdownMenuItem
                    onClick={() => {
                      setPriceUpdatePhoneId(row.original.id)
                    }}
                  >
                    Update Price
                  </DropdownMenuItem>
                )}

                {hasPermission(Permissions.PHONE_UPDATE) && (
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/phones/${row.original.id}/edit`)
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                )}

                {hasPermission(Permissions.PHONE_DELETE) && (
                  <DropdownMenuItem
                    onClick={() => {
                      setAction({
                        action: "delete",
                        itemId: row.original.id,
                        extraState: {
                          name: row.original.title,
                        },
                      })
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [hasPermission, router, handleDelete, setPriceUpdatePhoneId]
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
    priceUpdatePhone,
    setPriceUpdatePhoneId,
  }
}
