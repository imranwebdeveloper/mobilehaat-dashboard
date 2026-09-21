"use client"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table"
import DisplayTableLoading from "@/components/common/DisplayTableLoading"
import DisplayTableError from "@/components/common/DisplayTableError"
import { DisplayTableNoDataFound } from "@/components/common/DisplayTableNoDataFound"
import { CustomPagination } from "@/components/CustomPagination"
import { useParams } from "next/navigation"
import { flexRender } from "@tanstack/react-table"
import { useUserPermissionsTable } from "./useUserPermissions"
import UserInfo from "./UserInfo"
import { TableHeader as UserTableHeader } from "./TableHeader"

const PermissionTable = ({ fullDetails }: { fullDetails?: boolean }) => {
  const params = useParams<{ id: string }>()
  const userId = params.id!
  const {
    table,
    columns,
    isLoading,
    isError,
    tableData,
    pagination,
    userData,
  } = useUserPermissionsTable(userId)

  return (
    <div className="flex flex-1 flex-col gap-4">
      <UserInfo user={userData} showFullDetails={fullDetails} />
      <UserTableHeader />
      <div className="flex-1">
        <div className="overflow-hidden rounded-lg border bg-background">
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
                  <TableRow
                    key={row.id}
                    className="group transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
      <CustomPagination paginate={pagination} />
    </div>
  )
}

export default PermissionTable
