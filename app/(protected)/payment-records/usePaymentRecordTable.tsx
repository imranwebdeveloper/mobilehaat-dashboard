"use client"

import { useMemo, useRef, useState } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IPaymentRecord, PaymentMethod } from "./payment-record.type"
import { paymentRecordApi, downloadInvoicePdf } from "./payment-record.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { usePermission } from "@/hooks/usePermission"
import { useAppSelector } from "@/config/reduxStoreConfig"
import { Permissions } from "@/config/permissions"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVerticalIcon, DownloadIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import StatusBadge from "@/components/common/StatusBadge"

type PaymentRow = {
  id: string
  sellerName: string
  planName: string
  method: PaymentMethod
  amount: number
  currency: string
  reference: string
  status: string
  createdAt: string
  raw: IPaymentRecord
}

const methodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.BKASH]: "Bkash",
  [PaymentMethod.NAGAD]: "Nagad",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.OTHER]: "Other",
}

const mapPaymentsToTable = (payments: IPaymentRecord[]): PaymentRow[] => {
  return payments.map((payment) => ({
    id: payment._id,
    sellerName: payment.seller_id?.store_name || "—",
    planName: payment.subscription_id?.plan_name || "—",
    method: payment.payment_method,
    amount: payment.amount,
    currency: payment.currency,
    reference: payment.transaction_reference || "—",
    status: payment.status,
    createdAt: new Date(payment.createdAt).toLocaleDateString(),
    raw: payment,
  }))
}

export const usePaymentRecordTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const token = useAppSelector((state) => state.global.auth?.access_token)
  const tokenRef = useRef(token)
  tokenRef.current = token

  const { data, isLoading, isError } =
    paymentRecordApi.useGetAllPaymentRecordsQuery({
      ...query,
      limit: 15,
    })

  const tableData = useMemo(() => mapPaymentsToTable(data?.data || []), [data])

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId)
      await downloadInvoicePdf(paymentId, tokenRef.current)
      toast.success("Invoice downloaded successfully")
    } catch {
      toast.error("Failed to download invoice")
    } finally {
      setDownloadingId(null)
    }
  }

  const columns = useMemo<ColumnDef<PaymentRow>[]>(
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
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => methodLabel[row.original.method] || "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const symbol =
            row.original.currency === "BDT" ? "৳" : row.original.currency
          return (
            <div className="text-sm font-medium">
              {symbol}
              {row.original.amount.toLocaleString()}
            </div>
          )
        },
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {row.original.reference}
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
        header: "Date",
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
              {hasPermission(Permissions.PAYMENT_RECORD_UPDATE) &&
                (row.original.status === "PENDING" ||
                  row.original.status === "SUBMITTED") && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "edit",
                        itemId: row.original.id,
                        extraState: {
                          name: `${row.original.sellerName} — ${row.original.planName}`,
                          record: row.original.raw,
                        },
                      })
                    }
                  >
                    Edit
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.PAYMENT_RECORD_UPDATE) &&
                (row.original.status === "PENDING" ||
                  row.original.status === "SUBMITTED") && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "verify",
                        itemId: row.original.id,
                        extraState: {
                          name: `${row.original.sellerName} — ${row.original.planName}`,
                        },
                      })
                    }
                  >
                    Verify
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.PAYMENT_RECORD_UPDATE) &&
                (row.original.status === "PENDING" ||
                  row.original.status === "SUBMITTED") && (
                  <DropdownMenuItem
                    onClick={() =>
                      setAction({
                        action: "reject",
                        itemId: row.original.id,
                        extraState: {
                          name: `${row.original.sellerName} — ${row.original.planName}`,
                        },
                      })
                    }
                   >
                    Reject
                  </DropdownMenuItem>
                )}

              {hasPermission(Permissions.PAYMENT_RECORD_READ) &&
                row.original.status === "VERIFIED" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={downloadingId === row.original.id}
                    onClick={() => handleDownloadInvoice(row.original.id)}
                  >
                    {downloadingId === row.original.id ? (
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <DownloadIcon className="mr-2 h-4 w-4" />
                    )}
                    Download Invoice
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [setAction, hasPermission, downloadingId]
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
