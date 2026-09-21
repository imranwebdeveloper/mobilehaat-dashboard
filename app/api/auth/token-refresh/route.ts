import { encode, getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const cookieName = "next-auth.session-token"
const maxAge = 15 * 24 * 60 * 60
const secret = process.env["NEXTAUTH_SECRET"]

export async function POST(req: NextRequest) {
  if (!secret) {
    return NextResponse.json(
      { error: "Secret not configured" },
      { status: 500 }
    )
  }

  const token = await getToken({
    req,
    secret,
    cookieName,
    secureCookie: process.env.NODE_ENV === "production",
  })

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as {
    access_token?: string
    refresh_token?: string
  } | null

  if (!body?.access_token || !body?.refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 })
  }

  const jwt = await encode({
    token: {
      ...token,
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    },
    secret,
    maxAge,
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: cookieName,
    value: jwt,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  })
  return res
}
