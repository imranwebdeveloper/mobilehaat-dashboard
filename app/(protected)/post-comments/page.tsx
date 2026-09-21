import Wrapper from "./Wrapper"
import PageHeader from "./PageHeader"

export const metadata = {
  title: "Post Comments",
  description: "Manage blog post comments and moderation",
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
