"use client"

import { withAuth } from "@/components/hoc"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import { Permissions } from "@/config/permissions"
import UserMediaTable from "./UserMediaTable"
import UserMediaModal from "./UserMediaModal"

const Wrapper = () => {
  return (
    <div className="flex h-full flex-1 flex-col bg-muted px-6 py-4">
      <QueryAndModalWrapper>
        <UserMediaTable />
        <UserMediaModal />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.MEDIA_READ],
})
