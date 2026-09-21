import { Metadata } from "next"
import Wrapper from "./Wrapper"

export const metadata: Metadata = {
  title: "Media",
  description: "Media",
}

const MediaPage = () => {
  return (
    <div>
      <Wrapper />
    </div>
  )
}

export default MediaPage
