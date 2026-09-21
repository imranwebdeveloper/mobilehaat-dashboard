import Wrapper from "./Wrapper"
import PageHeader from "./PageHeader"

export const metadata = {
  title: "Phone Categories",
  description: "Manage phone categories",
}

const page = () => {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default page
