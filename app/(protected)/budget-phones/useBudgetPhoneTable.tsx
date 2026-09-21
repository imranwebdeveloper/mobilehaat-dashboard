"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IBudgetPhone, BudgetPhoneStatus } from "./budget-phones.type"
import { budgetPhoneApi } from "./budget-phones.api"
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

import { EllipsisVerticalIcon } from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"

type BudgetPhoneRow = {
  id: string
  title: string
  slug: string
  description: string
  min_price: number
  max_price: number
  status: string
  phone_count: number
  createdAt: string
}

const mapBudgetPhonesToTable = (
  budgetPhones: IBudgetPhone[]
): BudgetPhoneRow[] => {
  return budgetPhones.map((budgetPhone) => ({
    id: budgetPhone._id!,
    title: budgetPhone.title,
    slug: budgetPhone.slug,
    description: budgetPhone.description?.substring(0, 60) + "..." || "",
    min_price: budgetPhone.min_price || 0,
    max_price: budgetPhone.max_price || 0,
    status:
      budgetPhone.status === BudgetPhoneStatus.ACTIVE ? "Active" : "Inactive",
    phone_count: budgetPhone.rankings?.length || 0,
    createdAt: new Date(budgetPhone.createdAt!).toLocaleDateString(),
  }))
}

export const useBudgetPhoneTable = () => {
  const router = useRouter()
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = budgetPhoneApi.useGetAllBudgetPhoneQuery(
    {
      ...query,
    }
  )

  const tableData = useMemo(
    () => mapBudgetPhonesToTable(data?.data || []),
    [data]
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const columns = useMemo<ColumnDef<BudgetPhoneRow>[]>(
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
              {hasPermission(Permissions.BUDGET_PHONE_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/budget-phones/${row.original.id}/edit`)
                  }
                >
                  Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.BUDGET_PHONE_DELETE) && (
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
