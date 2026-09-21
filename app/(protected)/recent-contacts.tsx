"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { ArrowUpRightIcon, InboxIcon } from "lucide-react"
import type { DashboardRecentContact } from "./dashboard.type"

const contactStatusTone: Record<string, string> = {
  NEW: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-500",
  IN_PROGRESS:
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-500",
  RESOLVED:
    "border-chart-1/30 bg-chart-1/10 text-chart-1 dark:bg-chart-1/15 dark:text-chart-1",
  ARCHIVED: "border-border bg-muted text-muted-foreground",
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

function timeAgo(value: string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function RecentContactsTable({
  recentContacts,
}: {
  recentContacts: DashboardRecentContact[]
}) {
  const unread = recentContacts.filter((contact) => !contact.is_read).length

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-chart-3/15 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3">
            <InboxIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>Latest contact form submissions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No contacts yet.
                </TableCell>
              </TableRow>
            ) : (
              recentContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground ${
                          !contact.is_read ? "ring-2 ring-chart-3/40" : ""
                        }`}
                      >
                        {initials(contact.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex max-w-[220px] items-center gap-1.5">
                          <span
                            className={`truncate ${
                              contact.is_read ? "" : "font-semibold"
                            }`}
                          >
                            {contact.name}
                          </span>
                          {!contact.is_read && (
                            <span className="size-1.5 shrink-0 rounded-full bg-chart-3" />
                          )}
                        </div>
                        <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="max-w-[240px] truncate text-muted-foreground">
                      {contact.subject || "No subject"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                        contactStatusTone[contact.status] ??
                        "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {contact.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    {timeAgo(contact.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {recentContacts.length > 0 && (
          <div className="mt-3 border-t pt-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/contacts">
                View all contacts
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
