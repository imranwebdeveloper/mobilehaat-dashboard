import { login, logout } from "@/store/global.slice"
import { AuthUser } from "@/store/global.type"
import { RootState } from "@/config/reduxStoreConfig"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query"
import { signOut } from "next-auth/react"
import { reduxTags } from "./reduxTags"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env["API_URL"],
  prepareHeaders: (headers, { getState }) => {
    const apiKey = process.env["API_KEY"]
    if (apiKey) {
      headers.set("x-api-key", apiKey)
    }
    const store = getState() as RootState
    const token = store.global.auth?.access_token
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
})

// Guarded: concurrent 401s must trigger exactly one sign-out redirect.
let isLoggingOut = false

function forceLogout(api: { dispatch: (action: unknown) => void }) {
  if (isLoggingOut || typeof window === "undefined") return
  isLoggingOut = true
  api.dispatch(logout())
  // Clears the NextAuth session cookie (breaks the reseed loop) and
  // lands on sign-in. Full navigation also resets RTK Query state.
  void signOut({ callbackUrl: "/auth/signin" })
}

const syncSessionCookie = async (
  access_token: string,
  refresh_token: string
) => {
  try {
    await fetch("/api/auth/token-refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, refresh_token }),
      cache: "no-store",
    })
  } catch {
    // Non-fatal: the next full reload reseeds tokens from the session cookie.
  }
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  const auth = (api.getState() as RootState).global.auth
  const isUnauthorized =
    typeof result.error === "object" &&
    result.error !== null &&
    "status" in result.error &&
    (result.error as { status?: number }).status === 401

  if (isUnauthorized && auth?.refresh_token) {
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refresh_token: auth.refresh_token },
      },
      api,
      extraOptions
    )

    const data = (refreshResult.data as { data?: AuthUser } | undefined)?.data
    if (data?.access_token && data?.refresh_token && data?.user?._id) {
      api.dispatch(
        login({
          id: data.user._id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user: data.user,
        })
      )
      void syncSessionCookie(data.access_token, data.refresh_token)
      result = await rawBaseQuery(args, api, extraOptions)
      // The retry itself came back 401 (tokens rejected again) → log out.
      if (
        typeof result.error === "object" &&
        result.error !== null &&
        "status" in result.error &&
        (result.error as { status?: number }).status === 401
      ) {
        forceLogout(api)
      }
    } else {
      // Refresh token invalid/expired/consumed → dead session, log out.
      forceLogout(api)
    }
  } else if (isUnauthorized) {
    // 401 with no refresh token available → nothing to recover, log out.
    forceLogout(api)
  }

  return result
}

export const configApi = createApi({
  reducerPath: "config",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [...reduxTags],
})
