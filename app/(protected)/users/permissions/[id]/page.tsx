import Wrapper from "./Wrapper"
import PageHeader from "./PageHeader"
import { Suspense } from "react"

export const metadata = {
  title: "User Permissions",
  description: "User Permissions",
}

const page = () => {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense>
        <PageHeader />
        <Wrapper />
      </Suspense>
    </div>
  )
}

export default page
