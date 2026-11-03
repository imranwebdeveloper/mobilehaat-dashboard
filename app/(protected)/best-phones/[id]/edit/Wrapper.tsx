"use client"
import Form from "../../Form"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"

const Wrapper = () => {
  return (
    <div className="flex-1">
      <Form />
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.BUDGET_PHONE_UPDATE],
})
