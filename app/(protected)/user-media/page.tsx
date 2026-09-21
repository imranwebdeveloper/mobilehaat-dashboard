import Wrapper from "./Wrapper"

export const metadata = {
  title: "User Media",
  description: "Manage uploaded user media files",
}

const page = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-2xl font-bold">User Media</h1>
        <p className="text-sm text-muted-foreground">
          Manage uploaded media files from users
        </p>
      </div>
      <Wrapper />
    </div>
  )
}

export default page
