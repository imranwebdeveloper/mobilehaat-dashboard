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
import { ArrowUpRightIcon, MessageSquareTextIcon } from "lucide-react"
import type { DashboardUnapprovedComment } from "./dashboard.type"

const commentStatusTone: Record<string, string> = {
  PENDING:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
  SPAM: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-500",
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

function targetHref(comment: DashboardUnapprovedComment) {
  if (!comment.target.id) return null
  return comment.type === "phone"
    ? `/phones/${comment.target.id}`
    : `/posts/${comment.target.id}/edit`
}

export function PendingCommentsTable({
  pendingComments,
  phonePending,
  postPending,
}: {
  pendingComments: DashboardUnapprovedComment[]
  phonePending: number
  postPending: number
}) {
  const total = phonePending + postPending

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2">
            <MessageSquareTextIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>Comments to Moderate</CardTitle>
            <CardDescription>
              Unapproved phone &amp; post comments awaiting review
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingComments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No comments awaiting moderation.
                </TableCell>
              </TableRow>
            ) : (
              pendingComments.map((comment) => {
                const href = targetHref(comment)
                return (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                        {comment.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 max-w-[380px] text-sm">
                        {comment.content}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {comment.author}
                    </TableCell>
                    <TableCell>
                      {href ? (
                        <Link
                          href={href}
                          className="max-w-[240px] truncate hover:text-primary"
                        >
                          {comment.target.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          {comment.target.title}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                          commentStatusTone[comment.status] ??
                          "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {comment.status.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        {pendingComments.length > 0 && (
          <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/phone-comments">
                Phone comments
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/post-comments">
                Post comments
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
