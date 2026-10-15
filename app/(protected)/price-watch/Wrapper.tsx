"use client"

import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import PriorityOverview from "./PriorityOverview"

const Wrapper = () => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-muted px-6 py-4">
      <QueryAndModalWrapper>
        <PriorityOverview />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.PHONE_READ],
})
