"use client"

import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangleIcon, PlusIcon } from "lucide-react"
import Permission from "@/components/common/Permission"
import Link from "next/link"
import { StatCardsSkeleton } from "./dashboard-skeletons"
import { RecentContactsTable } from "./recent-contacts"
import { RecentPhonesTable } from "./recent-phones-table"
import { PendingCommentsTable } from "./pending-comments"
import { useGetDashboardOverviewQuery } from "./dashboard.api"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const Dashboard = () => {
  const { data, isLoading, isError } = useGetDashboardOverviewQuery(null)

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/40">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border bg-background p-8 text-center shadow-sm">
          <AlertTriangleIcon className="size-8 text-destructive" />
          <h2 className="text-lg font-semibold">Dashboard unavailable</h2>
          <p className="text-sm text-muted-foreground">
            Could not load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const overview = data?.data
  const counts = overview?.counts

  return (
    <div className="flex flex-1 flex-col bg-muted">
      <div className="p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                {getGreeting()}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {getDateLabel()} · Here&apos;s what&apos;s happening on
                MobileHaat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Permission permission={Permissions.POST_CREATE}>
                <Button asChild variant="outline" size="sm">
                  <Link href="/posts/create">
                    <PlusIcon className="size-4" />
                    New Post
                  </Link>
                </Button>
              </Permission>
              <Permission permission={Permissions.PHONE_CREATE}>
                <Button asChild size="sm">
                  <Link href="/phones/create">
                    <PlusIcon className="size-4" />
                    Add Phone
                  </Link>
                </Button>
              </Permission>
            </div>
          </div>

          {isLoading ? (
            <StatCardsSkeleton />
          ) : (
            <SectionCards counts={counts} trend={overview?.trend ?? []} />
          )}

          <div className="grid gap-4">
            {isLoading ? (
              <Skeleton className="h-[360px] w-full rounded-xl" />
            ) : (
              <ChartAreaInteractive trend={overview?.trend ?? []} />
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : (
            <PendingCommentsTable
              pendingComments={overview?.pendingComments ?? []}
              phonePending={counts?.pending_phone_comments ?? 0}
              postPending={counts?.pending_post_comments ?? 0}
            />
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : (
              <RecentPhonesTable recentPhones={overview?.recentPhones ?? []} />
            )}
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : (
              <RecentContactsTable
                recentContacts={overview?.recentContacts ?? []}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(Dashboard, {
  requiredPermissions: [Permissions.DASHBOARD_READ],
})
