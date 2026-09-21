"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { ISellerSubscription } from "./seller-subscription.type"
import { sellerSubscriptionApi } from "./seller-subscription.api"
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

type SubscriptionRow = {
  id: string
  sellerName: string
  planName: string
  status: string
  cancelAtPeriodEnd: boolean
  price: number
  currency: string
  source: string
  duration: string
  startAt: string
  endAt: string
}

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "BDT" ? "৳" : currency
  return `${symbol}${amount.toLocaleString()}`
}

const formatDate = (value?: string | null) => {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

const mapSubscriptionsToTable = (
  subs: ISellerSubscription[]
): SubscriptionRow[] => {
  return subs.map((sub) => ({
    id: sub._id,
    sellerName: sub.seller_id?.store_name || "—",
    planName: sub.plan_name || sub.plan_id?.name || "—",
    status: sub.status,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    price: sub.price,
    currency: sub.currency,
    source: sub.source,
    duration: `${sub.duration_months ?? 1} mo`,
    startAt: formatDate(sub.start_at),
    endAt: formatDate(sub.end_at),
  }))
}

export const useSellerSubscriptionTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } =
    sellerSubscriptionApi.useGetAllSellerSubscriptionsQuery({
      ...query,
      limit: 15,
    })

  const tableData = useMemo(
    () => mapSubscriptionsToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<SubscriptionRow>[]>(
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
        accessorKey: "planName",
        header: "Plan",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.planName}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <StatusBadge status={row.original.status} />
            {row.original.status === "ACTIVE" &&
              row.original.cancelAtPeriodEnd && (
                <span className="text-xs text-amber-600 font-medium">
                  Cancel at period end
                </span>
              )}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {formatCurrency(row.original.price, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => <StatusBadge status={row.original.source} />,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.duration}
          </div>
        ),
      },
      {
        accessorKey: "startAt",
        header: "Period",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {row.original.startAt} → {row.original.endAt}
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
              {hasPermission(Permissions.SELLER_SUBSCRIPTION_UPDATE) &&
                row.original.status === "ACTIVE" && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        setAction({
                          action: "cancel",
                          itemId: row.original.id,
                          extraState: { name: row.original.sellerName },
                        })
                      }
                    >
                      Cancel at Period End
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() =>
                        setAction({
                          action: "cancel-immediate",
                          itemId: row.original.id,
                          extraState: { name: row.original.sellerName },
                        })
                      }
                    >
                      Cancel Immediately
                    </DropdownMenuItem>
                  </>
                )}

              {hasPermission(Permissions.SELLER_SUBSCRIPTION_UPDATE) &&
                row.original.status === "PENDING" && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() =>
                      setAction({
                        action: "cancel",
                        itemId: row.original.id,
                        extraState: { name: row.original.sellerName },
                      })
                    }
                  >
                    Cancel Subscription
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.SELLER_SUBSCRIPTION_UPDATE) &&
                row.original.status === "ACTIVE" && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "suspend",
                        itemId: row.original.id,
                        extraState: { name: row.original.sellerName },
                      })
                    }
                  >
                    Suspend
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.SELLER_SUBSCRIPTION_UPDATE) &&
                (row.original.status === "ACTIVE" ||
                  row.original.status === "SUSPENDED") && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "expire",
                        itemId: row.original.id,
                        extraState: { name: row.original.sellerName },
                      })
                    }
                  >
                    Expire Now
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.SELLER_SUBSCRIPTION_UPDATE) &&
                row.original.status === "SUSPENDED" && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "activate",
                        itemId: row.original.id,
                        extraState: { name: row.original.sellerName },
                      })
                    }
                  >
                    Reactivate
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.SELLER_SUBSCRIPTION_DELETE) &&
                (row.original.status === "EXPIRED" ||
                  row.original.status === "CANCELLED") && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() =>
                      setAction({
                        action: "delete",
                        itemId: row.original.id,
                        extraState: { name: row.original.sellerName },
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
