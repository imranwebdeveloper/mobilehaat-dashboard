/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableCell, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"

const DisplayTableLoading = ({ columns }: { columns: any[] }) => {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          {columns.map((col, j) => (
            <TableCell key={j}>
              <Skeleton className="h-6 w-full rounded-md" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default DisplayTableLoading
