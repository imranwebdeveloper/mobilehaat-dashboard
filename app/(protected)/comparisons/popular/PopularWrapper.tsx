"use client"

import { withAuth } from "@/components/hoc"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import { Permissions } from "@/config/permissions"
import PopularTableHeader from "./PopularTableHeader"
import PopularTable from "./PopularTable"

const PopularWrapper = () => {
  return (
    <div className="flex h-full flex-1 flex-col bg-muted px-6 py-4">
      <QueryAndModalWrapper>
        <PopularTableHeader />
        <PopularTable />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(PopularWrapper, {
  requiredPermissions: [Permissions.COMPARISON_READ],
})
