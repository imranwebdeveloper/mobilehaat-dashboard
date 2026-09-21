"use client"

import { useEffect, useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"

import { IUser } from "./users.type"
import { userApi } from "./users.api"
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
import CustomAvatar from "@/components/common/CustomAvatar"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
  verified: boolean
  avatar: string
}

const mapUsersToTable = (users: IUser[]): UserRow[] => {
  return users.map((user) => ({
    id: user._id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.roles.length ? user.roles[0].name : "USER",
    status: user.is_active ? "Active" : "Inactive",
    verified: user.is_verified,
    avatar: user.avatar?.url || "",
  }))
}

export const useUserTable = () => {
  const router = useRouter()
  const { query } = useQueryContext()
  const { setAction, resetAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = userApi.useGetAllUserQuery({
    ...query,
  })

  const tableData = useMemo(() => mapUsersToTable(data?.data || []), [data])

  const columns = useMemo<ColumnDef<UserRow>[]>(
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
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CustomAvatar name={row.original.name} src={row.original.avatar} />
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },

      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.role}</Badge>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },

      {
        accessorKey: "verified",
        header: "Verified",
        cell: ({ row }) =>
          row.original.verified ? (
            <span className="text-green-600">✅ Yes</span>
          ) : (
            <span className="text-red-500">❌ No</span>
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
              <DropdownMenuItem
                onClick={() => router.push(`/users/${row.original.id}`)}
              >
                View
              </DropdownMenuItem>

              {hasPermission(Permissions.USER_UPDATE) && (
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

              {hasPermission(Permissions.USER_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/users/permissions/${row.original.id}`)
                  }
                >
                  Permissions
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.USER_DELETE) && (
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
    [setAction, hasPermission, router]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  })

  const selectedRows = table.getSelectedRowModel().rows

  const selectedIds = useMemo(
    () => selectedRows.map((r) => r.original.id),
    [selectedRows]
  )

  const selectedNames = useMemo(
    () => selectedRows.map((r) => r.original.name).join(", "),
    [selectedRows]
  )

  useEffect(() => {
    if (selectedIds.length) {
      setAction({
        action: "letter",
        itemIds: selectedIds,
        extraState: { name: selectedNames },
      })
    } else {
      resetAction()
    }
  }, [selectedIds, selectedNames])

  return {
    table,
    columns,
    tableData,
    paginate: data?.paginate,
    isLoading,
    isError,
  }
}
