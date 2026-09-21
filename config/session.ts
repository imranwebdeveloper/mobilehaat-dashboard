import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { AuthUser } from "@/store/global.type"

export const getUserAuthSession = async () => {
  const session = await getServerSession(authOptions)
  return session as AuthUser | null
}
