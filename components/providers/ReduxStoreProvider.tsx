"use client"

import { login, setSiteSettings } from "@/store/global.slice"
import { AuthUser, SiteSettings } from "@/store/global.type"
import { makeStore } from "@/config/reduxStoreConfig"
import { JSX, useMemo } from "react"
import { Provider } from "react-redux"

export default function ReduxStoreProvider({
  children,
  session,
  siteSettings,
}: {
  children: React.ReactNode
  session: AuthUser | null
  siteSettings: SiteSettings
}): JSX.Element {
  const store = useMemo(() => {
    const s = makeStore()
    if (session) {
      s.dispatch(login(session))
      s.dispatch(setSiteSettings(siteSettings))
    }
    return s
    // Store created once; session captured at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Provider store={store}>{children}</Provider>
}
