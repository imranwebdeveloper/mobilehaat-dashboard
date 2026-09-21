"use client"
import PhoneForm from "../../Form"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { useParams } from "next/navigation"
import Permission from "@/components/common/Permission"

const Wrapper = () => {
  const params = useParams()
  const phoneId = params.id as string

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Link href={`/phones/${phoneId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to View
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Phone</h2>
        <Permission permission={Permissions.PHONE_READ}>
          <Link href={`/phones/${phoneId}/price-history`}>
            <Button size="sm" variant="outline">
              Price History
            </Button>
          </Link>
        </Permission>
      </div>
      <div className="mt-4">
        <PhoneForm />
      </div>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.PHONE_UPDATE],
})
