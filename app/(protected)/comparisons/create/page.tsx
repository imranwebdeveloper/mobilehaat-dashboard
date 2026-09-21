import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Create Comparison",
  description: "Create a new phone comparison",
}

const page = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default page
