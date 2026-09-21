"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"

import { ISellerOffer } from "./seller-offer.type"
import { sellerOfferApi } from "./seller-offer.api"
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
import { formatBDT, formatDate } from "@/lib/utils"

type OfferRow = {
  id: string
  sellerName: string
  phoneTitle: string
  variant: string
  price: number
  stock: number
  status: string
  expiresAt: string | null
  createdAt: string
}

const mapOffersToTable = (offers: ISellerOffer[]): OfferRow[] => {
  return offers.map((offer) => ({
    id: offer._id,
    sellerName: offer.seller_id?.store_name || "—",
    phoneTitle: offer.phone_id?.title || "—",
    variant: offer.variant_id
      ? `${offer.variant_id.ram}GB / ${offer.variant_id.storage}GB`
      : "—",
    price: offer.price,
    stock: offer.stock,
    status: offer.status,
    expiresAt: offer.expiresAt,
    createdAt: formatDate(offer.createdAt),
  }))
}

export const useSellerOfferTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } =
    sellerOfferApi.useGetAllSellerOffersQuery({
      ...query,
    })

  const tableData = useMemo(
    () => mapOffersToTable(data?.data || []),
    [data?.data]
  )

  const columns = useMemo<ColumnDef<OfferRow>[]>(
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
        accessorKey: "sellerName",
        header: "Seller",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.sellerName}</div>
        ),
      },
      {
        accessorKey: "phoneTitle",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.phoneTitle}</div>
        ),
      },
      {
        accessorKey: "variant",
        header: "Variant",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.variant}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {formatBDT(row.original.price)}
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.stock === 0 ? (
              <span className="text-amber-600 font-medium">Out of stock</span>
            ) : (
              row.original.stock
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {formatDate(row.original.expiresAt)}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
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
                <Link href={`/seller-offers/${row.original.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>

              {hasPermission(Permissions.SELLER_OFFER_MODERATE) &&
                row.original.status !== "ACTIVE" && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "activate",
                        itemId: row.original.id,
                        extraState: { name: row.original.phoneTitle },
                      })
                    }
                  >
                    Activate
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.SELLER_OFFER_MODERATE) &&
                row.original.status === "ACTIVE" && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "pause",
                        itemId: row.original.id,
                        extraState: { name: row.original.phoneTitle },
                      })
                    }
                  >
                    Pause
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.SELLER_OFFER_DELETE) && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { name: row.original.phoneTitle },
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
