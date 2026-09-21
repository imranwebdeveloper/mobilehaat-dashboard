"use client"
import SellerForm from "../../Form"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { useParams } from "next/navigation"

const Wrapper = () => {
  const params = useParams()
  const sellerId = params.id as string

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Link href={`/sellers/${sellerId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to View
          </Button>
        </Link>
      </div>
      <SellerForm />
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.SELLER_UPDATE],
})
