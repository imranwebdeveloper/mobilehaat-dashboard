"use client"

import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import TableHeader from "./TableHeader"
import Table from "./Table"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import Modal from "./Modal"
import TablePriceUpdateDialog from "./TablePriceUpdateDialog"
import { usePhoneTable } from "./usePhoneTable"

const PhoneContent = () => {
  const phoneTable = usePhoneTable()

  return (
    <>
      <TableHeader />
      <Table phoneTable={phoneTable} />
      <Modal />
      <TablePriceUpdateDialog phoneTable={phoneTable} />
    </>
  )
}

const Wrapper = () => {
  return (
    <div className="flex flex-1 flex-col px-6 py-4">
      <QueryAndModalWrapper>
        <PhoneContent />
      </QueryAndModalWrapper>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.PHONE_READ],
})
