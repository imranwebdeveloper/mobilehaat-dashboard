import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getUserAuthSession } from "@/config/session"
import { redirect } from "next/navigation"

export default async function ProtectLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getUserAuthSession()
  if (!session) {
    redirect("/auth/signin")
  }
  return (
    <div>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="sidebar" />
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
