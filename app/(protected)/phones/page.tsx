import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Phones",
  description: "Manage all phones and their specifications.",
}

const PhonesPage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default PhonesPage
