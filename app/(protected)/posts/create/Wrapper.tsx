"use client"
import PostForm from "../Form"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"

const Wrapper = () => {
  return (
    <div className="flex- flex">
      <PostForm />
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.POST_CREATE],
})
