import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Create Best Phone Page",
  description: "Create a new best phone page",
}

const CreateBestPhonePage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default CreateBestPhonePage
