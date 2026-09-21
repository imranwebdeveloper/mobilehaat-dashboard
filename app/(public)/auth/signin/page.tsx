import Wrapper from "./Wrapper"
import { redirect } from "next/navigation"
import { getUserAuthSession } from "@/config/session"

export const metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default async function SignInPage() {
  const session = await getUserAuthSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Wrapper />
    </div>
  )
}
