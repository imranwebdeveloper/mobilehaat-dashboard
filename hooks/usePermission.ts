"use client"

import { UserRole } from "@/store/global.constants"
import { useAppSelector } from "@/config/reduxStoreConfig"

export const usePermission = () => {
  const { auth } = useAppSelector((state) => state.global)

  const user = auth?.user
  const userRoles = user?.roles || []
  const userPermissions = user?.permissions || []

  const isSuperAdmin = userRoles.some(
    (role) => role.name === UserRole.superAdmin
  )

  const hasPermission = (permissionName?: string) => {
    if (!permissionName) return true

    if (isSuperAdmin) return true

    return userPermissions.some(
      (permission) => permission.name === permissionName
    )
  }

  const hasAnyPermission = (permissions: string[]) => {
    if (isSuperAdmin) return true

    return permissions.some((p) => userPermissions.some((up) => up.name === p))
  }

  const hasAllPermissions = (permissions: string[]) => {
    if (isSuperAdmin) return true

    return permissions.every((p) => userPermissions.some((up) => up.name === p))
  }

  return {
    user,
    isSuperAdmin,
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
