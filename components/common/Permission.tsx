"use client"

import { ReactNode } from "react"
import { usePermission } from "@/hooks/usePermission"

type PermissionProps = {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
}

export const PermissionWrapper = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  let allowed = true

  if (permission) {
    allowed = hasPermission(permission)
  }

  if (permissions) {
    allowed = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  if (!allowed) return <>{fallback ? fallback : null}</>

  return <>{children}</>
}

export default PermissionWrapper

// exmaple

{
  /* <Permission permission="user.update">
  <Button>Edit</Button>
</Permission> */
}

// ;<Permission permissions={["user.create", "user.update"]}>
//   <Button>Create User</Button>
// </Permission>

// ;<Permission permissions={["user.update", "user.permission.update"]} requireAll>
//   <Button>Advanced Settings</Button>
// </Permission>
