import PageHeader from "./PageHeader"
import Wrapper from "./Wrapper"

export const metadata = {
  title: "Create Budget Phone Collection",
  description: "Create a new budget phone collection",
}

const CreateBudgetPhonePage = () => {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <PageHeader />
      <Wrapper />
    </div>
  )
}

export default CreateBudgetPhonePage
