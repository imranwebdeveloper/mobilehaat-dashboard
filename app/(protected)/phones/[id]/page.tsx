import Wrapper from "./Wrapper"
import { SmartphoneIcon } from "lucide-react"

export const metadata = {
  title: "View Phone",
  description: "View detailed specifications of the phone.",
}

const ViewPhonePage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted/50">
      <div className="flex flex-col border-b border-muted bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <SmartphoneIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Phone Details</h1>
            <p className="text-sm text-muted-foreground">
              Detailed specifications and pricing information.
            </p>
          </div>
        </div>
      </div>
      <Wrapper />
    </div>
  )
}

export default ViewPhonePage
