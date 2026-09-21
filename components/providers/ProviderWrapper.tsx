"use client"

import React from "react"
import ReduxStoreProvider from "./ReduxStoreProvider"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { AuthUser, SiteSettings } from "@/store/global.type"
import { TooltipProvider } from "../ui/tooltip"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import InitialDataProvider from "./InitialDataProvider"

const ProviderWrapper = ({
  children,
  session,
  siteSettings,
}: {
  children: React.ReactNode
  session: AuthUser | null
  siteSettings: SiteSettings
}) => {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ReduxStoreProvider siteSettings={siteSettings} session={session}>
          <TooltipProvider>
            <ThemeHotkey />
            <Toaster richColors />
            <InitialDataProvider>{children}</InitialDataProvider>
          </TooltipProvider>
        </ReduxStoreProvider>
      </NextThemesProvider>
    </SessionProvider>
  )
}

export default ProviderWrapper

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event?.defaultPrevented || event?.repeat) {
        return
      }

      if (event?.metaKey || event?.ctrlKey || event?.altKey) {
        return
      }

      if (event?.key?.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event?.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}
