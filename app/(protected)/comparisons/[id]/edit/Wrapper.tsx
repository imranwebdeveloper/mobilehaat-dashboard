"use client"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import Form from "../../Form"

const Wrapper = () => {
  return (
    <div className="flex-1">
      <Form />
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.COMPARISON_UPDATE],
})
