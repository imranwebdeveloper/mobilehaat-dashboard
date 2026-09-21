import type { Metadata } from "next"
import Wrapper from "./Wrapper"
import { Tag } from "lucide-react"

export const metadata: Metadata = {
  title: "View Seller Offer",
  description: "View seller offer details, pricing, and moderation.",
}

const ViewSellerOfferPage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted/50">
      <div className="flex flex-col border-b border-muted bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Tag className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Offer Details</h1>
            <p className="text-sm text-muted-foreground">
              Offer information, pricing, and moderation controls.
            </p>
          </div>
        </div>
      </div>
      <Wrapper />
    </div>
  )
}

export default ViewSellerOfferPage
