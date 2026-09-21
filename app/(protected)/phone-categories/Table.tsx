"use client"

import { flexRender } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import DisplayTableLoading from "@/components/common/DisplayTableLoading"
import DisplayTableError from "@/components/common/DisplayTableError"
import { DisplayTableNoDataFound } from "@/components/common/DisplayTableNoDataFound"

import { CustomPagination } from "@/components/CustomPagination"
import { usePhoneCategoryTable } from "./usePhoneCategoryTable"

const PhoneCategoryTable = () => {
  const { table, columns, tableData, paginate, isLoading, isError } =
    usePhoneCategoryTable()

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <div className="flex-1 overflow-hidden rounded-lg border bg-background">
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
      </div>

      <CustomPagination paginate={paginate} />
    </div>
  )
}

export default PhoneCategoryTable
