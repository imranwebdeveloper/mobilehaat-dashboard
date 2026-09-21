"use client"

import Image from "next/image"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  UsersIcon,
  FileTextIcon,
  Settings2Icon,
  SmartphoneIcon,
  GalleryThumbnails,
  LayoutDashboard,
  Newspaper,
  Mail,
  WalletIcon,
  ArrowLeftRight,
  PenTool,
  Store,
  Activity,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useSiteSetting } from "@/hooks/useSiteSetting"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"
import Link from "next/link"

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  permission?: string
}

const navGroups: {
  title: string
  items: NavItem[]
}[] = [
  {
    title: "",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: <LayoutDashboard />,
        permission: Permissions.DASHBOARD_READ,
      },
    ],
  },
  {
    title: "Phones",
    items: [
      {
        title: "Phones",
        url: "/phones",
        icon: <SmartphoneIcon />,
        permission: Permissions.PHONE_READ,
      },
      {
        title: "Budget Phones",
        url: "/budget-phones",
        icon: <WalletIcon />,
        permission: Permissions.BUDGET_PHONE_READ,
      },
      {
        title: "Comparisons",
        url: "/comparisons",
        icon: <ArrowLeftRight />,
        permission: Permissions.COMPARISON_READ,
      },
    ],
  },
  {
    title: "Posts",
    items: [
      {
        title: "Posts",
        url: "/posts",
        icon: <FileTextIcon />,
        permission: Permissions.POST_READ,
      },
      {
        title: "Authors",
        url: "/authors",
        icon: <PenTool />,
        permission: Permissions.AUTHOR_READ,
      },
    ],
  },
  {
    title: "Marketplace",
    items: [
      {
        title: "Sellers",
        url: "/sellers",
        icon: <Store />,
        permission: Permissions.SELLER_READ,
      },
      {
        title: "Plans",
        url: "/seller-plans",
        icon: <Store />,
        permission: Permissions.SELLER_PLAN_READ,
      },
    ],
  },
  {
    title: "Common",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: <Settings2Icon />,
        permission: Permissions.SETTING_READ,
      },
      {
        title: "Users",
        url: "/users",
        icon: <UsersIcon />,
        permission: Permissions.USER_READ,
      },
      {
        title: "Contacts",
        url: "/contacts",
        icon: <Mail />,
        permission: Permissions.CONTACT_READ,
      },
      {
        title: "Media",
        url: "/media",
        icon: <GalleryThumbnails />,
        permission: Permissions.MEDIA_READ,
      },
      {
        title: "User Media",
        url: "/user-media",
        icon: <GalleryThumbnails />,
        permission: Permissions.MEDIA_READ,
      },
      {
        title: "Newsletter",
        url: "/newsletter",
        icon: <Newspaper />,
        permission: Permissions.NEWSLETTER_READ,
      },
      {
        title: "Logs",
        url: "/monitoring",
        icon: <Activity />,
        permission: Permissions.MONITORING_OVERVIEW,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathName = usePathname()
  const siteName = useSiteSetting("site_name")
  const { user, hasAnyPermission } = usePermission()

  const canShow = (item: NavItem) =>
    !item.permission || !user || hasAnyPermission([item.permission])

  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter(canShow) }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt={siteName || "MobileHaat"}
                  width={626}
                  height={96}
                  className="h-auto w-full"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) =>
          group.title ? (
            <NavDocuments
              key={group.title}
              items={group.items}
              title={group.title}
              pathName={pathName}
            />
          ) : (
            <NavMain
              key={group.title}
              items={group.items}
              pathName={pathName}
            />
          )
        )}
        <NavSecondary items={[]} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
