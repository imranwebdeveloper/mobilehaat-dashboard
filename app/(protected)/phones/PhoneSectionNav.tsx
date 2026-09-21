"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Smartphone,
  Tag,
  FolderOpen,
  MessageSquare,
} from "lucide-react"

const navItems = [
  { label: "Phones", url: "/phones", icon: Smartphone },
  { label: "Brands", url: "/brands", icon: Tag },
  { label: "Categories", url: "/phone-categories", icon: FolderOpen },
  { label: "Comments", url: "/phone-comments", icon: MessageSquare },
]

const PhoneSectionNav = () => {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      {navItems.map((item) => {
        const isActive = pathname === item.url

        return (
          <Link
            key={item.url}
            href={item.url}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export default PhoneSectionNav
