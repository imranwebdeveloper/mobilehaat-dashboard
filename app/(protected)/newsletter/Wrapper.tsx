"use client"

import { withAuth } from "@/components/hoc"
import Table from "./Table"
import TableHeader from "./TableHeader"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import Modal from "./Modal"
import { Permissions } from "@/config/permissions"

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
  requiredPermissions: [Permissions.NEWSLETTER_DELETE],
})
