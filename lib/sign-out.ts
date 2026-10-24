"use client"

import { config } from "@/config/config"
import { signOut } from "next-auth/react"

const REVOKE_TIMEOUT_MS = 4000

/**
 * Revoke the backend refresh token, then clear the NextAuth session.
 *
 * next-auth's signOut only deletes the local session cookie; without this
 * call the rotated refresh token stays valid in the database for its full
 * 15-day TTL. The revoke is best-effort so a backend outage never traps the
 * user in a signed-in state.
 */
export async function signOutAndRevoke(refreshToken?: string | null) {
  if (refreshToken) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REVOKE_TIMEOUT_MS)
    try {
      await fetch(`${config.env.API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
        signal: controller.signal,
      })
    } catch {
      // Best-effort: still sign out locally.
    } finally {
      clearTimeout(timer)
    }
  }

  await signOut({ callbackUrl: "/auth/signin" })
}
