"use client"
import SellerForm from "../Form"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"

const Wrapper = () => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-6 pt-4">
        <Link href="/sellers">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <SellerForm />
      </div>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.SELLER_CREATE],
})
