"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { ISeller } from "./seller.type"
import { useGetAllSellersQuery } from "./seller.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVerticalIcon, EyeIcon } from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"
import { useGeoMaps } from "./useGeoMaps"

type SellerRow = {
  id: string
  storeName: string
  slug: string
  ownerName: string
  email: string
  phone: string
  businessType?: string
  district: string
  status: string
  verificationStatus: string
  createdAt: string
}

const businessTypeLabel = (type?: string) => {
  if (!type) return "—"
  return type.toLowerCase().replace(/_/g, " ")
}

const mapSellersToTable = (
  sellers: ISeller[],
  getDistrictName: (id?: string) => string | undefined
): SellerRow[] => {
  return sellers.map((seller) => ({
    id: seller._id,
    storeName: seller.store_name,
    slug: seller.slug,
    ownerName: seller.owner_name,
    email: seller.email,
    phone: seller.phone,
    businessType: seller.business_type,
    district: getDistrictName(seller.address?.district_id) || "",
    status: seller.status,
    verificationStatus: seller.verification?.status || "",
    createdAt: new Date(seller.createdAt).toLocaleDateString(),
  }))
}

export const useSellerTable = () => {
  const { query } = useQueryContext()
  const { hasPermission } = usePermission()
  const router = useRouter()
  const { getDistrictName } = useGeoMaps()

  const { data, isLoading, isError } = useGetAllSellersQuery({
    ...query,
  })

  const tableData = useMemo(
    () => mapSellersToTable(data?.data || [], getDistrictName),
    [data, getDistrictName]
  )

  const columns = useMemo<ColumnDef<SellerRow>[]>(
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
        accessorKey: "storeName",
        header: "Store",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="leading-none font-medium">
              {row.original.storeName}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ownerName",
        header: "Owner",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.ownerName}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm">{row.original.email}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.phone}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "businessType",
        header: "Business Type",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {businessTypeLabel(row.original.businessType)}
          </Badge>
        ),
      },
      {
        accessorKey: "district",
        header: "District",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.district || "—"}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "verificationStatus",
        header: "Verification",
        cell: ({ row }) => (
          <StatusBadge status={row.original.verificationStatus} />
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
              <DropdownMenuItem
                onClick={() => router.push(`/sellers/${row.original.id}`)}
              >
                <EyeIcon className="h-4 w-4" /> View
              </DropdownMenuItem>

              {hasPermission(Permissions.SELLER_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/sellers/${row.original.id}/edit`)
                  }
                >
                  Edit Info
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [hasPermission, router]
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
