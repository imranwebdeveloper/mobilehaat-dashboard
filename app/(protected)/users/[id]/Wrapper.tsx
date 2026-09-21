"use client"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import PermissionTable from "../permissions/[id]/Table"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"

const Wrapper = () => {
  return (
    <div className="flex h-full flex-1 flex-col bg-muted px-6 py-4">
      <QueryAndModalWrapper>
        <PermissionTable fullDetails />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.USER_READ],
})
