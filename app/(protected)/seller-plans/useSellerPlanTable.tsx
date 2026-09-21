"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { ISellerPlan, SellerPlanStatus } from "./seller-plan.type"
import { sellerPlanApi } from "./seller-plan.api"
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

import { EllipsisVerticalIcon } from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"

type SellerPlanRow = {
  id: string
  name: string
  slug: string
  description: string
  features: string[]
  monthlyPrice: number
  currency: string
  isPaid: boolean
  maxActiveOffers: number
  featuredListing: boolean
  priorityListing: boolean
  analytics: boolean
  verifiedBadge: boolean
  sortOrder: number
  isDefault: boolean
  status: string
  createdAt: string
}

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "BDT" ? "৳" : currency
  return `${symbol}${amount.toLocaleString()}`
}

const mapSellerPlansToTable = (plans: ISellerPlan[]): SellerPlanRow[] => {
  return plans.map((plan) => ({
    id: plan._id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description || "",
    features: plan.features || [],
    monthlyPrice: plan.monthly_price,
    currency: plan.currency,
    isPaid: !!plan.is_paid,
    maxActiveOffers: plan.max_active_offers,
    featuredListing: !!plan.featured_listing,
    priorityListing: !!plan.priority_listing,
    analytics: !!plan.analytics,
    verifiedBadge: !!plan.verified_badge,
    sortOrder: plan.sort_order || 0,
    isDefault: !!plan.is_default,
    status: plan.status === SellerPlanStatus.ACTIVE ? "Active" : "Inactive",
    createdAt: new Date(plan.createdAt).toLocaleDateString(),
  }))
}

export const useSellerPlanTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = sellerPlanApi.useGetAllSellerPlanQuery({
    ...query,
    limit: 15,
  })

  const tableData = useMemo(
    () => mapSellerPlansToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<SellerPlanRow>[]>(
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
        header: "Plan",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="leading-none font-medium">
              {row.original.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "monthlyPrice",
        header: "Monthly Price",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {formatCurrency(row.original.monthlyPrice, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: "isPaid",
        header: "Type",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.isPaid ? (
              <Badge variant="default">Paid</Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "maxActiveOffers",
        header: "Max Offers",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {row.original.maxActiveOffers}
          </div>
        ),
      },
      {
        id: "features",
        header: "Features",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-1">
              {row.original.featuredListing && (
                <Badge variant="success" className="text-xs">
                  Featured
                </Badge>
              )}
              {row.original.priorityListing && (
                <Badge variant="default" className="text-xs">
                  Priority
                </Badge>
              )}
              {row.original.analytics && (
                <Badge variant="secondary" className="text-xs">
                  Analytics
                </Badge>
              )}
              {row.original.verifiedBadge && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            {row.original.features.length > 0 && (
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                {row.original.features.slice(0, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
                {row.original.features.length > 3 && (
                  <li className="font-medium">
                    +{row.original.features.length - 3} more
                  </li>
                )}
              </ul>
            )}
          </div>
        ),
      },
      {
        accessorKey: "sortOrder",
        header: "Sort",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.sortOrder}</div>
        ),
      },
      {
        accessorKey: "isDefault",
        header: "Default",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.isDefault ? (
              <Badge variant="success">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
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
              {hasPermission(Permissions.SELLER_PLAN_UPDATE) && (
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

              {hasPermission(Permissions.SELLER_PLAN_DELETE) && (
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
