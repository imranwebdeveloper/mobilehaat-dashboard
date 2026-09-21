/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { TableCell, TableRow } from "../ui/table"

const DisplayTableError = ({ columns }: { columns: any[] }) => {
  return (
    <>
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="py-10 text-center font-semibold text-red-600"
        >
          ❌ Error loading users. Please refresh.
        </TableCell>
      </TableRow>
    </>
  )
}

export default DisplayTableError
