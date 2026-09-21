import Wrapper from "./Wrapper"
import { Store } from "lucide-react"

export const metadata = {
  title: "Create Seller",
  description: "Create a seller account for an existing user.",
}

const CreateSellerPage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted/50">
      <div className="flex flex-col border-b border-muted bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Create Seller</h1>
            <p className="text-sm text-muted-foreground">
              Create a seller account for an existing user. A user can only have
              one seller.
            </p>
          </div>
        </div>
      </div>
      <Wrapper />
    </div>
  )
}

export default CreateSellerPage
