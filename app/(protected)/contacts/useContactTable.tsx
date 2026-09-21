"use client"

import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { IContact } from "./contacts.type"
import { contactApi } from "./contacts.api"
import { useQueryContext } from "@/hooks/useQueryContext"
import { useModalContext } from "@/hooks/useModalContext"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  EllipsisVerticalIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"
import { Badge } from "@/components/ui/badge"

type ContactRow = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  status: string
  is_read: boolean
  createdAt: string
}

const mapContactsToTable = (contacts: IContact[]): ContactRow[] => {
  return contacts.map((contact) => ({
    id: contact._id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    subject: contact.subject,
    status: contact.status,
    is_read: contact.is_read,
    createdAt: new Date(contact.createdAt).toLocaleDateString(),
  }))
}

export const useContactTable = () => {
  const { query } = useQueryContext()
  const { setAction } = useModalContext()
  const { hasPermission } = usePermission()

  const { data, isLoading, isError } = contactApi.useGetAllContactsQuery({
    ...query,
  })

  const tableData = useMemo(() => mapContactsToTable(data?.data || []), [data])

  const columns = useMemo<ColumnDef<ContactRow>[]>(
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
        header: "User info",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <UserIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{row.original.name}</span>
              {!row.original.is_read && (
                <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                  NEW
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MailIcon className="h-3 w-3" />
              <span>{row.original.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <PhoneIcon className="h-3 w-3" />
              <span>{row.original.phone}</span>
            </div>
          </div>
        ),
      },

      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-sm">
            {row.original.subject}
          </div>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },

      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.createdAt}
          </span>
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
              {hasPermission(Permissions.CONTACT_UPDATE) && (
                <DropdownMenuItem
                  onClick={() =>
                    setAction({
                      action: "edit",
                      itemId: row.original.id,
                    })
                  }
                >
                  View / Edit
                </DropdownMenuItem>
              )}

              {hasPermission(Permissions.CONTACT_DELETE) && (
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
