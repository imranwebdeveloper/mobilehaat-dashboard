/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { TableCell, TableRow } from "../ui/table"

export const DisplayTableNoDataFound = ({ columns }: { columns: any[] }) => {
  return (
    <TableRow>
      <TableCell
        colSpan={columns.length}
        className="py-10 text-center text-gray-500"
      >
        🙁 No users found.
      </TableCell>
    </TableRow>
  )
}
