"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import {
  SmartphoneIcon,
  FileTextIcon,
  InboxIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  type LucideIcon,
} from "lucide-react"
import type {
  DashboardCounts,
  DashboardTrendPoint,
} from "../app/(protected)/dashboard.type"

interface SectionCardsProps {
  counts?: DashboardCounts
  trend?: DashboardTrendPoint[]
}

const emptyCounts: DashboardCounts = {
  phones: 0,
  brands: 0,
  posts: 0,
  authors: 0,
  contacts: 0,
  unread_contacts: 0,
  newsletter_subscribers: 0,
  phone_comments: 0,
  post_comments: 0,
  pending_phone_comments: 0,
  pending_post_comments: 0,
  budget_phones: 0,
  comparisons: 0,
  phone_categories: 0,
  phone_variants: 0,
  phones_this_month: 0,
  posts_this_month: 0,
  contacts_this_month: 0,
}

interface KpiCardProps {
  label: string
  value: number
  delta: number
  deltaLabel: string
  footer: string
  icon: LucideIcon
  iconClass: string
  accentClass: string
  sparkKey: "phones" | "posts" | "contacts" | "subscribers"
  sparkline: DashboardTrendPoint[]
}

function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  footer,
  icon: Icon,
  iconClass,
  accentClass,
  sparkKey,
  sparkline,
}: KpiCardProps) {
  const rising = delta >= 0
  const sparkData = sparkline.slice(-30)

  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accentClass}`}
        aria-hidden
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClass}`}
          >
            <Icon className="size-5" />
          </div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
        </div>
        <div className="h-10 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparkData}
              margin={{ top: 2, bottom: 0, left: 0, right: 0 }}
            >
              <defs>
                <linearGradient
                  id={`spark-${sparkKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={sparkKey}
                stroke="var(--color-chart-1)"
                strokeWidth={1.5}
                fill={`url(#spark-${sparkKey})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-3xl font-bold tracking-tight tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge
            variant={rising ? "default" : "secondary"}
            className="gap-1 px-2 py-0.5"
          >
            {rising ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
            +{delta.toLocaleString()} {deltaLabel}
          </Badge>
          <span className="truncate text-muted-foreground">{footer}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function SectionCards({
  counts = emptyCounts,
  trend = [],
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Phones"
        value={counts.phones}
        delta={counts.phones_this_month}
        deltaLabel="this month"
        footer={`${counts.phone_variants.toLocaleString()} variants · ${counts.phone_categories.toLocaleString()} categories`}
        icon={SmartphoneIcon}
        iconClass="bg-primary/10 text-primary dark:bg-primary/20"
        accentClass="bg-primary"
        sparkKey="phones"
        sparkline={trend}
      />
      <KpiCard
        label="Blog & Guides"
        value={counts.posts}
        delta={counts.posts_this_month}
        deltaLabel="this month"
        footer={`${counts.authors.toLocaleString()} authors · ${counts.post_comments.toLocaleString()} comments`}
        icon={FileTextIcon}
        iconClass="bg-chart-2/15 text-chart-2"
        accentClass="bg-chart-2"
        sparkKey="posts"
        sparkline={trend}
      />
      <KpiCard
        label="Contacts"
        value={counts.contacts}
        delta={counts.contacts_this_month}
        deltaLabel="this month"
        footer={`${counts.unread_contacts.toLocaleString()} unread`}
        icon={InboxIcon}
        iconClass="bg-chart-3/15 text-chart-3"
        accentClass="bg-chart-3"
        sparkKey="contacts"
        sparkline={trend}
      />
      <KpiCard
        label="Newsletter"
        value={counts.newsletter_subscribers}
        delta={0}
        deltaLabel="active"
        footer={`${counts.brands.toLocaleString()} brands · ${counts.comparisons.toLocaleString()} comparisons`}
        icon={UsersIcon}
        iconClass="bg-chart-5/15 text-chart-5"
        accentClass="bg-chart-5"
        sparkKey="subscribers"
        sparkline={trend}
      />
    </div>
  )
}
