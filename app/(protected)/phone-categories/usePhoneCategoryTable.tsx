"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IPhoneCategory, PhoneCategoryStatus } from "./phone-category.type"
import { phoneCategoryApi } from "./phone-category.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"

import { Badge } from "@/components/ui/badge"
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
import Image from "next/image"
import { IMedia } from "../media/media.type"

type PhoneCategoryRow = {
  id: string
  name: string
  slug: string
  thumbnail: string | null
  icon_name: string
  status: string
  order: number
  is_featured: boolean
  phone_count: number
  createdAt: string
}

const mapPhoneCategoriesToTable = (
  phoneCategories: IPhoneCategory[]
): PhoneCategoryRow[] => {
  return phoneCategories.map((phoneCategory) => ({
    id: phoneCategory._id,
    name: phoneCategory.name,
    slug: phoneCategory.slug,
    thumbnail: (phoneCategory.thumbnail as IMedia)?.url || null,
    icon_name: phoneCategory.icon_name || "-",
    status:
      phoneCategory.status === PhoneCategoryStatus.ACTIVE
        ? "Active"
        : "Inactive",
    order: phoneCategory.order || 0,
    is_featured: !!phoneCategory.is_featured,
    phone_count: phoneCategory.phone_count || 0,
    createdAt: new Date(phoneCategory.createdAt).toLocaleDateString(),
  }))
}

export const usePhoneCategoryTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } =
    phoneCategoryApi.useGetAllPhoneCategoryQuery({
      ...query,
    })

  const tableData = useMemo(
    () => mapPhoneCategoriesToTable(data?.data || []),
    [data]
  )

  const columns = useMemo<ColumnDef<PhoneCategoryRow>[]>(
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
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
              {row.original.thumbnail ? (
                <Image
                  src={row.original.thumbnail}
                  alt={row.original.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <span className="text-xs">
                    {row.original.icon_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <span className="leading-none font-medium">
                {row.original.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.slug}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "is_featured",
        header: "Featured",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.is_featured ? (
              <Badge variant="success">Yes</Badge>
            ) : (
              <Badge variant="outline">No</Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "phone_count",
        header: "Phones",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.phone_count}</div>
        ),
      },
      {
        accessorKey: "icon_name",
        header: "Icon",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.icon_name}</div>
        ),
      },
      {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.order}</div>
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
              {hasPermission(Permissions.PHONE_CATEGORY_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "edit",
                      itemId: row.original.id,
                    })
                  }
                >
                  Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.PHONE_CATEGORY_DELETE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "delete",
                      itemId: row.original.id,
                      extraState: { name: row.original.name },
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
