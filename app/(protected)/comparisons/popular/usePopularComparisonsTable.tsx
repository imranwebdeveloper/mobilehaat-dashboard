"use client"

import { useMemo } from "react"
import Image from "next/image"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"

import { IComparisonAnalytics } from "../comparisons.type"
import { comparisonsApi } from "../comparisons.api"
import { useQueryContext } from "@/hooks/useQueryContext"

import { Badge } from "@/components/ui/badge"

type PopularRow = {
  id: string
  phoneAName: string
  phoneAImage: string | null
  phoneBName: string
  phoneBImage: string | null
  totalComparisons: number
  lastComparedAt: string
}

const mapToTable = (data: IComparisonAnalytics[]): PopularRow[] => {
  return data.map((item) => ({
    id: item._id,
    phoneAName: item.phoneA?.title || "Deleted Phone",
    phoneAImage: item.phoneA?.thumbnail?.url || null,
    phoneBName: item.phoneB?.title || "Deleted Phone",
    phoneBImage: item.phoneB?.thumbnail?.url || null,
    totalComparisons: item.totalComparisons,
    lastComparedAt: item.lastComparedAt
      ? formatDistanceToNow(new Date(item.lastComparedAt), {
          addSuffix: true,
        })
      : "Never",
  }))
}

export const usePopularComparisonsTable = () => {
  const { query } = useQueryContext()

  const { data, isLoading, isError } =
    comparisonsApi.useGetPopularComparisonsQuery({
      ...query,
    })

  const tableData = useMemo(
    () => mapToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<PopularRow>[]>(
    () => [
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-muted-foreground">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "phoneAName",
        header: "Phone A",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.phoneAImage ? (
              <Image
                src={row.original.phoneAImage}
                alt={row.original.phoneAName}
                width={32}
                height={32}
                className="rounded-md object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs">
                N/A
              </div>
            )}
            <span className="text-sm font-medium">
              {row.original.phoneAName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "phoneBName",
        header: "Phone B",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.phoneBImage ? (
              <Image
                src={row.original.phoneBImage}
                alt={row.original.phoneBName}
                width={32}
                height={32}
                className="rounded-md object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs">
                N/A
              </div>
            )}
            <span className="text-sm font-medium">
              {row.original.phoneBName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalComparisons",
        header: "Comparisons",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-semibold">
            {row.original.totalComparisons.toLocaleString()}
          </Badge>
        ),
      },
      {
        accessorKey: "lastComparedAt",
        header: "Last Compared",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.lastComparedAt}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
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
