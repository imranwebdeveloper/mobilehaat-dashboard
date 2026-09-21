"use client"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import PostForm from "../../Form"

const Wrapper = () => {
  return (
    <div className="flex- flex">
      <PostForm />
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.POST_UPDATE],
})
