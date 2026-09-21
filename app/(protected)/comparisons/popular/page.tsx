import PopularWrapper from "./PopularWrapper"
import PopularPageHeader from "./PopularPageHeader"

export const metadata = {
  title: "Popular Comparisons",
  description: "Most compared phone pairs",
}

const page = () => {
  return (
    <div className="flex flex-1 flex-col">
      <PopularPageHeader />
      <PopularWrapper />
    </div>
  )
}

export default page
