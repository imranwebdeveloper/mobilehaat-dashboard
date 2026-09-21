"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CustomPagination } from "@/components/CustomPagination"
import { IPagination } from "@/store/global.type"
import DisplayTableLoading from "@/components/common/DisplayTableLoading"
import DisplayTableError from "@/components/common/DisplayTableError"
import { DisplayTableNoDataFound } from "@/components/common/DisplayTableNoDataFound"
import LogDetailDrawer from "./LogDetailDrawer"
import { TooltipProvider } from "@/components/ui/tooltip"

export type LogRow = Record<string, unknown>

const emptyPagination: IPagination = {
  total: 0,
  has_next: false,
  current_page: 1,
  total_pages: 1,
  per_page: 50,
  has_previous: false,
  next_page: false,
  previous_page: false,
}

const mapPaginatedResponse = (response: {
  data: LogRow[]
  total: number
  page: number
  limit: number
  totalPages: number
}): { rows: LogRow[]; paginate: IPagination } => {
  const currentPage = response.page || 1
  const perPage = response.limit || 50
  const totalPages = response.totalPages || 1

  return {
    rows: response.data || [],
    paginate: {
      total: response.total || 0,
      has_next: currentPage < totalPages,
      current_page: currentPage,
      total_pages: totalPages,
      per_page: perPage,
      has_previous: currentPage > 1,
      next_page: currentPage < totalPages ? currentPage + 1 : false,
      previous_page: currentPage > 1 ? currentPage - 1 : false,
    },
  }
}

interface MonitoringTableProps {
  data?: {
    data: LogRow[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  columns: ColumnDef<LogRow, unknown>[]
  isLoading: boolean
  isError: boolean
  onPageChange?: (page: number) => void
}

const MonitoringTable = ({
  data,
  columns,
  isLoading,
  isError,
  onPageChange,
}: MonitoringTableProps) => {
  const [selectedRow, setSelectedRow] = useState<LogRow | null>(null)

  const { rows, paginate } = useMemo(
    () =>
      data
        ? mapPaginatedResponse(data)
        : { rows: [], paginate: emptyPagination },
    [data]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => String(row._id || row.timestamp || index),
  })

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto rounded-lg border bg-background">
        <TooltipProvider>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-secondary">
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
            ) : rows.length === 0 ? (
              <DisplayTableNoDataFound columns={columns} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedRow(row.original)}
                >
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
        </TooltipProvider>
      </div>
      <CustomPagination paginate={paginate} onPageChange={onPageChange} />
      <LogDetailDrawer
        row={selectedRow}
        open={!!selectedRow}
        onOpenChange={(open) => { if (!open) setSelectedRow(null) }}
      />
    </div>
  )
}

export default MonitoringTable
