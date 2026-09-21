"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useAppSelector } from "@/config/reduxStoreConfig"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { usePathname } from "next/navigation"
import {
  LogOutIcon,
  SettingsIcon,
  UserRoundIcon,
  ChevronsUpDownIcon,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { NotificationBell } from "./notification"
import { ThemeToggle } from "./ThemeToggle"
import Link from "next/link"

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/phones": "Phones",
  "/phone-categories": "Categories",
  "/brands": "Brands",
  "/phone-comments": "Phone Comments",
  "/budget-phones": "Budget Phones",
  "/comparisons": "Comparisons",
  "/posts": "Posts",
  "/post-categories": "Categories",
  "/authors": "Authors",
  "/post-comments": "Post Comments",
  "/media": "Media",
  "/users": "Users",
  "/newsletter": "Newsletter",
  "/contacts": "Contacts",
  "/settings": "Settings",
}

function titleForPath(path: string) {
  const match = Object.entries(routeTitles).find(
    ([key]) => path === key || path.startsWith(`${key}/`)
  )
  return match?.[1] ?? path.split("/").filter(Boolean).pop() ?? "Dashboard"
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function SiteHeader() {
  const { isMobile } = useSidebar()
  const { auth } = useAppSelector((state) => state.global)
  const pathname = usePathname()

  const user = auth?.user
  if (!user) return null

  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
  const email = user.email
  const avatar = user.avatar?.url
  const role = user.roles?.[0]?.name
  const pageTitle = titleForPath(pathname)

  return (
    <header className="flex border-b bg-background">
      <div className="flex min-h-(--header-height) w-full flex-1 items-center gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-1.5">
          <SidebarTrigger className="-ml-1" />
          <span className="ml-1 hidden h-6 w-px self-center bg-border md:block" />
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">MobileHaat</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {pageTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />

          <span className="hidden h-6 w-px self-center bg-border sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-xl py-1.5 pr-2 pl-1.5 transition hover:bg-muted">
                <Avatar className="size-9 rounded-xl ring-1 ring-border">
                  <AvatarImage src={avatar || ""} alt={name} />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                    {initials(name) || "U"}
                  </AvatarFallback>
                </Avatar>

                {!isMobile && (
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="max-w-[140px] truncate text-sm font-medium">
                      {name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {role
                        ? role.toLowerCase().replace(/_/g, " ")
                        : "Administrator"}
                    </span>
                  </div>
                )}

                <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="min-w-56 rounded-xl"
            >
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="text-sm font-medium">{name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
                {role && (
                  <Badge variant="secondary" className="mt-1 w-fit capitalize">
                    {role.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <SettingsIcon />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/users">
                  <UserRoundIcon />
                  Manage users
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ redirect: true })}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
