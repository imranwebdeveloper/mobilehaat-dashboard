"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IBrand, BrandStatus } from "./brands.type"
import { brandApi } from "./brands.api"
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
import Image from "next/image"
import { IMedia } from "../media/media.type"

type BrandRow = {
  id: string
  name: string
  slug: string
  logo: string | null
  status: string
  phone_count: number
  order: number
  createdAt: string
}

const mapBrandsToTable = (brands: IBrand[]): BrandRow[] => {
  return brands.map((brand) => ({
    id: brand._id!,
    name: brand.name,
    slug: brand.slug,
    logo: (brand.logo as IMedia)?.url || null,
    status: brand.status === BrandStatus.ACTIVE ? "Active" : "Inactive",
    phone_count: brand.phone_count || 0,
    order: brand.order || 0,
    createdAt: new Date(brand.createdAt!).toLocaleDateString(),
  }))
}

export const useBrandTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = brandApi.useGetAllBrandQuery({
    ...query,
  })

  const tableData = useMemo(() => mapBrandsToTable(data?.data || []), [data])

  const columns = useMemo<ColumnDef<BrandRow>[]>(
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
        header: "Brand",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
              <Image
                src={row.original?.logo || "/placeholder.png"}
                alt={row.original.name}
                fill
                className="object-contain p-1"
              />
            </div>

            <div className="flex flex-col">
              <span className="leading-none font-medium">
                {row.original.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.slug}
              </span>
            </div>
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
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.order}</div>
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
              {hasPermission(Permissions.BRAND_UPDATE) && (
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

              {hasPermission(Permissions.BRAND_DELETE) && (
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
