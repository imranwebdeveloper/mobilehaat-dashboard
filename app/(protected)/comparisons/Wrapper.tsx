"use client"

import { withAuth } from "@/components/hoc"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import { Permissions } from "@/config/permissions"
import TableHeader from "./TableHeader"
import Modal from "./Modal"
import Table from "./Table"

const Wrapper = () => {
  return (
    <div className="flex h-full flex-1 flex-col bg-muted px-6 py-4">
      <QueryAndModalWrapper>
        <TableHeader />
        <Table />
        <Modal />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.COMPARISON_READ],
})
