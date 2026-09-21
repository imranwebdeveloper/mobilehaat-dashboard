import Wrapper from "./Wrapper"
import PageHeader from "./PageHeader"

export const metadata = {
  title: "Phone Comments",
  description: "Manage phone comments and reviews",
}

const page = () => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default page
