import { Geist_Mono, Roboto } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import ProviderWrapper from "@/components/providers/ProviderWrapper"
import { getUserAuthSession } from "@/config/session"
import { getSiteSettings } from "@/lib/fetcher"
import { Metadata } from "next"
import { Suspense } from "react"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const res = await getSiteSettings()
  const data = res.data

  return {
    title: data.meta_title,
    description: data.meta_description,
    icons: {
      icon: data.favicon,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getUserAuthSession()
  const res = await getSiteSettings()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable
      )}
    >
      <body>
        <Suspense>
          <ProviderWrapper siteSettings={res.data} session={session}>
            {children}
          </ProviderWrapper>
        </Suspense>
      </body>
    </html>
  )
}
