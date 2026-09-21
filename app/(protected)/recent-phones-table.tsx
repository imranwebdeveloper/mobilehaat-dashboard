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
import { ArrowUpRightIcon, SmartphoneIcon } from "lucide-react"
import type { DashboardRecentPhone } from "./dashboard.type"

const phoneStatusTone: Record<string, string> = {
  PUBLISHED:
    "border-chart-1/30 bg-chart-1/10 text-chart-1 dark:bg-chart-1/15 dark:text-chart-1",
  DRAFT: "border-border bg-muted text-muted-foreground",
  ARCHIVED: "border-border bg-muted text-muted-foreground",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
}

function formatPrice(price: number | null) {
  if (price === null) return "—"
  return `৳${price.toLocaleString("en-US")}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
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

export function RecentPhonesTable({
  recentPhones,
}: {
  recentPhones: DashboardRecentPhone[]
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <SmartphoneIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>Latest Phones</CardTitle>
            <CardDescription>
              Recently added models in the catalog
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPhones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No phones added yet.
                </TableCell>
              </TableRow>
            ) : (
              recentPhones.map((phone) => (
                <TableRow key={phone.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                        {initials(phone.brand)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/phones/${phone.id}`}
                          className="block max-w-[260px] truncate hover:text-primary"
                        >
                          {phone.title}
                        </Link>
                        <div className="max-w-[260px] truncate text-xs text-muted-foreground">
                          {phone.model || "Model n/a"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {phone.brand || "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatPrice(phone.price)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                        phoneStatusTone[phone.status] ??
                        "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {phone.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    {formatDate(phone.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {recentPhones.length > 0 && (
          <div className="mt-3 border-t pt-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/phones">
                View all phones
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
