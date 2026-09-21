import Wrapper from "./Wrapper"
import PageHeader from "./PageHeader"

export const metadata = {
  title: "Seller Subscriptions",
  description: "Manage seller subscription plans, activations and expiry",
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
