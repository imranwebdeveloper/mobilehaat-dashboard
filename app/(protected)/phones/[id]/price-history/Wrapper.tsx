"use client"

import { useParams } from "next/navigation"
import { useGetPhoneByIdQuery } from "../../phones.api"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import PriceHistoryTable from "./_components/PriceHistoryTable"

import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"

const Wrapper = () => {
  const params = useParams()
  const phoneId = params.id as string
  const { data: phoneData, isLoading: phoneLoading } =
    useGetPhoneByIdQuery(phoneId)

  if (phoneLoading) {
    return <div className="p-8 text-center">Loading phone details...</div>
  }

  if (!phoneData?.data) {
    return (
      <div className="p-8 text-center text-destructive">Phone not found</div>
    )
  }

  return (
    <QueryAndModalWrapper>
      <div className="flex flex-col gap-6 p-6 pb-24">
        <PriceHistoryTable phone={phoneData.data} />
      </div>
    </QueryAndModalWrapper>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.PHONE_READ],
})
