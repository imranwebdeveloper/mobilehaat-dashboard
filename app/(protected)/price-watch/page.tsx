import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Price Priority",
  description: "Which phone prices to check next, by stage and priority",
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
