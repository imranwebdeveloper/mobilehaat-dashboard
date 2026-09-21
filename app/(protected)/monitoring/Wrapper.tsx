"use client"

import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import MonitoringOverview from "./MonitoringOverview"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"

const Wrapper = () => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-muted px-6 py-4">
      <QueryAndModalWrapper>
        <MonitoringOverview />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.MONITORING_READ],
})
