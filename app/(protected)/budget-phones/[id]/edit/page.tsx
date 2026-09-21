import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Edit Budget Phone Collection",
  description: "Edit budget phone collection information",
}

const EditBudgetPhonePage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default EditBudgetPhonePage
