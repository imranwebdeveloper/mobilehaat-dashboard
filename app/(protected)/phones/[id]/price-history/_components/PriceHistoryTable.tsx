"use client"

import { useMemo } from "react"
import { flexRender } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useGetPhonePriceHistoryQuery } from "@/app/(protected)/phones/priceHistoryApi"
import { IPhone } from "@/app/(protected)/phones/phones.type"
import { formatBDT } from "@/lib/utils"
import { UserIcon, CalendarIcon } from "lucide-react"
import DisplayTableLoading from "@/components/common/DisplayTableLoading"
import DisplayTableError from "@/components/common/DisplayTableError"
import { DisplayTableNoDataFound } from "@/components/common/DisplayTableNoDataFound"
import { useQueryContext } from "@/hooks/useQueryContext"
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table"
import UpdatePriceDialog from "@/app/(protected)/phones/UpdatePriceDialog"

interface PriceHistoryTableProps {
  phone: IPhone
}

type PriceHistoryRow = {
  _id: string
  recordedAt: string
  price: number
  reason?: string
  actor?: {
    _id: string
    first_name: string
    last_name: string
    email: string
  }
}

const PriceHistoryTable = ({ phone }: PriceHistoryTableProps) => {
  const { query, setQuery } = useQueryContext()

  const { data, isLoading, isError, refetch } = useGetPhonePriceHistoryQuery({
    phoneId: phone._id,
    page: query.page || 1,
    limit: query.limit || 20,
    sortBy: query.sortBy || "desc",
    orderBy: query.orderBy || "recordedAt",
  })

  const handleLimitChange = (value: string) => {
    setQuery({ limit: Number(value), page: 1 })
  }

  const tableData = useMemo(() => data?.data || [], [data])
  const paginate = data?.paginate

  const columns = useMemo<ColumnDef<PriceHistoryRow>[]>(
    () => [
      {
        accessorKey: "recordedAt",
        header: "Date",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {new Date(row.original.recordedAt).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatBDT(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: "actor",
        header: "Updated By",
        cell: ({ row }) => {
          const actor = row.original.actor
          if (!actor)
            return <span className="text-sm text-muted-foreground">—</span>
          return (
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              {actor.first_name} {actor.last_name}
            </div>
          )
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.reason || "—"}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">Price History</h2>
        </div>
        <UpdatePriceDialog phone={phone} onUpdated={refetch} />
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <DisplayTableLoading columns={columns} />
            ) : isError ? (
              <DisplayTableError columns={columns} />
            ) : tableData.length === 0 ? (
              <DisplayTableNoDataFound columns={columns} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginate && paginate.total_pages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(paginate.current_page - 1) * paginate.per_page + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                paginate.current_page * paginate.per_page,
                paginate.total
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {paginate.total}
            </span>{" "}
            items
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(query.limit || 20)}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (paginate.has_previous) {
                        setQuery({ page: paginate.previous_page as number })
                      }
                    }}
                    aria-disabled={!paginate.has_previous}
                    className={
                      !paginate.has_previous
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="text-sm text-muted-foreground">
                    Page {paginate.current_page} of {paginate.total_pages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (paginate.has_next) {
                        setQuery({ page: paginate.next_page as number })
                      }
                    }}
                    aria-disabled={!paginate.has_next}
                    className={
                      !paginate.has_next ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceHistoryTable
