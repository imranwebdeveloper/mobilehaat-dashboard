/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useCallback } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Permission } from "@/store/global.type"
import { toast } from "sonner"
import { Shield, Lock, Globe } from "lucide-react"
import { userApi } from "../../users.api"
import { Switch } from "@/components/ui/switch"
import { globalApi } from "@/store/global.api"
import { useQueryContext } from "@/hooks/useQueryContext"

export type PermissionRow = {
  id: string
  name: string
  resource: string
  action: string
  scope: string
  is_system: boolean
}

const mapPermissionsToTable = (permissions: Permission[]): PermissionRow[] =>
  permissions.map((p) => ({
    id: p._id,
    name: p.name,
    resource: p.resource,
    action: p.action,
    scope: p.scope,
    is_system: p.is_system,
  }))

export const useUserPermissionsTable = (userId: string) => {
  const { query } = useQueryContext()
  const permissionApi = globalApi.useGetAllPermissionQuery({ ...query })

  const {
    data,
    isLoading: loadingUserPermissions,
    isError,
  } = userApi.useGetPermissionsByUserIdQuery(userId)

  const userData = useMemo(() => data?.data, [data])
  const userPermissions = useMemo(
    () => userData?.permissions || [],
    [userData?.permissions]
  )
  const pagination = permissionApi.data?.paginate

  const systemPermissions = useMemo(
    () => permissionApi.data?.data || [],
    [permissionApi.data]
  )

  const tableData = useMemo(
    () => mapPermissionsToTable(systemPermissions),
    [systemPermissions]
  )

  const [assignPermission, { isLoading: isAssigning }] =
    userApi.useAssignUserPermissionMutation()
  const [unassignPermission, { isLoading: isUnassigning }] =
    userApi.useUnAssignUserPermissionMutation()

  const togglePermission = useCallback(
    async (permissionId: string, grant: boolean) => {
      try {
        const payload = { user_id: userId, permission_id: permissionId }
        if (grant) {
          await assignPermission(payload).unwrap()
          toast.success("Permission granted")
        } else {
          await unassignPermission(payload).unwrap()
          toast.success("Permission revoked")
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "Action failed")
      }
    },
    [assignPermission, unassignPermission, userId]
  )

  const columns: ColumnDef<PermissionRow>[] = useMemo(
    () => [
      {
        accessorKey: "resource",
        header: "Resource",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Shield className="h-4 w-4 opacity-70" />
            <span className="capitalize">{row.original.resource}</span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const action = row.original.action.toLowerCase()
          const variants: Record<string, string> = {
            read: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            create:
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            update:
              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            delete:
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          }
          return (
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-bold uppercase ${variants[action] || ""}`}
            >
              {action}
            </span>
          )
        },
      },
      {
        accessorKey: "scope",
        header: "Scope",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {row.original.scope === "any" ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            <span className="text-xs font-medium capitalize">
              {row.original.scope || "N/A"}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: () => <div className="text-center">Access</div>,
        cell: ({ row }) => {
          const hasPermission = userPermissions.some(
            (p) => p.name === row.original.name
          )
          const processing = isAssigning || isUnassigning
          return (
            <div className="flex justify-center">
              <Switch
                disabled={processing}
                checked={hasPermission}
                onCheckedChange={(checked) =>
                  togglePermission(row.original.id, checked)
                }
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          )
        },
      },
    ],
    [userPermissions, isAssigning, isUnassigning, togglePermission]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return {
    table,
    tableData,
    columns,
    userPermissions,
    isLoading: loadingUserPermissions,
    isError,
    pagination,
    userData,
  }
}
