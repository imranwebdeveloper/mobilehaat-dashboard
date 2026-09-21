import { UserRole } from "@/store/global.constants"
import { ApiResponse } from "@/store/global.type"
import { IUser } from "@/app/(protected)/users/users.type"
import { getData } from "@/lib/fetcher"
import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const loginData = await getData<
            ApiResponse<{ access_token: string; refresh_token: string }>
          >("/auth/login", {
            method: "POST",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!loginData?.data?.access_token) return null

          const meData = await getData<ApiResponse<IUser>>("/auth/me", {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${loginData.data.access_token}`,
            },
          })

          if (!meData?.data) return null

          const user = meData.data

          const permissionUser = [
            UserRole.superAdmin,
            UserRole.admin,
            UserRole.manager,
            UserRole.editor,
          ]

          const usersRoles =
            user.roles?.map((item) => item.name) ?? []

          const hasPermission = permissionUser.some((item) =>
            usersRoles.includes(item)
          )

          if (!hasPermission) return null

          return {
            id: user._id,
            access_token: loginData.data.access_token,
            refresh_token: loginData.data.refresh_token,
            user,
          }
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60, // 15 days, matches refresh-token TTL
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    // Backend refresh tokens are single-use rotated. To avoid consuming each
    // other's tokens, next-auth does NOT refresh here — RTK owned reauth in
    // config/reduxApiConfig.ts is the single refresh path and it re-signs this
    // cookie via POST /api/auth/token-refresh after every rotation.
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user }
      }
      return token
    },
    async session({ session, token }) {
      return { ...session, ...token }
    },
  },
}
