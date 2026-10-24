import { login, logout } from "@/store/global.slice"
import { AuthUser } from "@/store/global.type"
import { RootState } from "@/config/reduxStoreConfig"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
} from "@reduxjs/toolkit/query"
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

// Single-flight refresh: backend refresh tokens are single-use and rotated on
// every use. If several queries 401 together and each calls /auth/refresh with
// the same token, the first rotation wins and the rest are rejected — which
// used to sign the user out. All concurrent callers now share one rotation.
type RefreshOutcome = "refreshed" | "invalid" | "unavailable"

let refreshInFlight: Promise<RefreshOutcome> | null = null

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

const is401 = (result: { error?: unknown }) =>
  typeof result.error === "object" &&
  result.error !== null &&
  "status" in result.error &&
  (result.error as { status?: number }).status === 401

/**
 * Rotate the session at most once across all in-flight 401s.
 *
 * - "refreshed":   new tokens are in the store
 * - "invalid":     the backend rejected the refresh token → session is dead
 * - "unavailable": network/timeout/5xx → transient, keep the session
 */
function refreshAuth(
  api: BaseQueryApi,
  extraOptions: object
): Promise<RefreshOutcome> {
  if (refreshInFlight) return refreshInFlight

  const auth = (api.getState() as RootState).global.auth

  refreshInFlight = (async (): Promise<RefreshOutcome> => {
    if (!auth?.refresh_token) return "invalid"

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
      // Persist the rotated pair so a reload reseeds from the session cookie.
      await syncSessionCookie(data.access_token, data.refresh_token)
      return "refreshed"
    }

    // Only an explicit 401/400 means the token itself is dead. Anything else
    // (FETCH_ERROR, TIMEOUT, 5xx) is transient and must not sign the user out.
    const status = (refreshResult.error as { status?: number | string })
      ?.status
    return status === 401 || status === 400 ? "invalid" : "unavailable"
  })()

  return refreshInFlight.finally(() => {
    refreshInFlight = null
  })
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  const tokenBefore = (api.getState() as RootState).global.auth?.access_token
  let result = await rawBaseQuery(args, api, extraOptions)

  if (!is401(result)) return result

  const auth = (api.getState() as RootState).global.auth

  if (!auth?.refresh_token) {
    // 401 with no refresh token available → nothing to recover, log out.
    forceLogout(api)
    return result
  }

  // A concurrent request already rotated the session while this one was in
  // flight; retry with the fresh access token instead of rotating again.
  if (tokenBefore && auth.access_token !== tokenBefore) {
    result = await rawBaseQuery(args, api, extraOptions)
    if (is401(result)) forceLogout(api)
    return result
  }

  const outcome = await refreshAuth(api, extraOptions)

  if (outcome === "invalid") {
    // Refresh token invalid/expired/consumed → dead session, log out.
    forceLogout(api)
    return result
  }

  if (outcome === "unavailable") {
    // Backend unreachable: surface the original 401 but keep the session so a
    // later request can retry the rotation.
    return result
  }

  result = await rawBaseQuery(args, api, extraOptions)
  // The retry itself came back 401 (tokens rejected again) → log out.
  if (is401(result)) forceLogout(api)

  return result
}

export const configApi = createApi({
  reducerPath: "config",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [...reduxTags],
})
