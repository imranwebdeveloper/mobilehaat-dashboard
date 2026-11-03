import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Edit Best Phone Page",
  description: "Edit best phone page information",
}

const EditBestPhonePage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default EditBestPhonePage
