"use client"

import { useState } from "react"
import {
  useGetMonitoringOverviewQuery,
  useGetMonitoringLogsQuery,
} from "./monitoring.api"
import {
  MonitoringOverview as MonitoringOverviewType,
  LogQuery,
} from "./monitoring.type"
import { allLogsColumns } from "./logColumns"
import MonitoringTable from "./MonitoringTable"
import LogFilters from "./LogFilters"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  Server,
  Bug,
  Lock,
  Zap,
  FileText,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PieChart, Pie, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status?.toUpperCase() || "UNKNOWN"
  const config: Record<string, { bg: string; dot: string; text: string }> = {
    HEALTHY: {
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
    },
    UP: {
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
    },
    PASS: {
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
    },
    DEGRADED: {
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
      text: "text-amber-700",
    },
    UNHEALTHY: {
      bg: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
    },
    DOWN: {
      bg: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
    },
    FAIL: {
      bg: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
    },
  }
  const c = config[normalized] || {
    bg: "bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
    text: "text-gray-600",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`size-1.5 rounded-full ${c.dot}`} />
      {normalized.replace(/_/g, " ").toLowerCase()}
    </span>
  )
}

const healthyValues = new Set(["up", "connected", "true", "ok", "healthy"])

function isComponentHealthy(value: unknown): boolean {
  if (value !== null && typeof value === "object") {
    const status = (value as Record<string, unknown>).status
    if (typeof status === "string") {
      return healthyValues.has(status.toLowerCase())
    }
  }
  return healthyValues.has(String(value).toLowerCase())
}

function classifyHealthComponents(details: Record<string, unknown>) {
  let healthy = 0
  let unhealthy = 0
  for (const value of Object.values(details)) {
    if (isComponentHealthy(value)) {
      healthy++
    } else {
      unhealthy++
    }
  }
  return { healthy, unhealthy }
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
}) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const SectionHeader = ({
  title,
  icon: Icon,
}: {
  title: string
  icon: React.ElementType
}) => (
  <div className="flex items-center gap-2">
    <div className="rounded-lg bg-muted p-1.5">
      <Icon className="size-4 text-muted-foreground" />
    </div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
  </div>
)

const StatBar = ({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value.toLocaleString()}{" "}
          <span className="font-normal text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border bg-muted/30 px-3 py-2">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-bold tabular-nums">{value.toLocaleString()}</p>
  </div>
)

const chartConfig = {
  healthy: { label: "Healthy", color: "var(--color-emerald-500)" },
  unhealthy: { label: "Unhealthy", color: "var(--color-red-500)" },
}

const MonitoringOverview = () => {
  const {
    data: overviewData,
    isLoading: overviewLoading,
    isError,
  } = useGetMonitoringOverviewQuery(null)

  const overview = overviewData?.data as MonitoringOverviewType | undefined

  const healthStatus = overview?.health?.status || "unknown"
  const healthDetails = overview?.health?.details || {}
  const stats = overview?.stats || {
    totalLogs: 0,
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    httpRequestCount: 0,
    securityEventCount: 0,
    auditEventCount: 0,
    errorEventCount: 0,
  }

  const { healthy: healthyCount, unhealthy: unhealthyCount } =
    classifyHealthComponents(healthDetails)
  const totalComponents = healthyCount + unhealthyCount
  const healthChartData = [
    { name: "Healthy", value: healthyCount, fill: "var(--color-emerald-500)" },
    ...(unhealthyCount > 0
      ? [
          {
            name: "Unhealthy",
            value: unhealthyCount,
            fill: "var(--color-red-500)",
          },
        ]
      : []),
  ]

  const [eventType, setEventType] = useState("all")
  const [query, setQuery] = useState<LogQuery>({ page: 1, limit: 50 })

  const logsQuery = useGetMonitoringLogsQuery({
    ...query,
    page: query.page || 1,
    limit: query.limit || 50,
    event: eventType === "all" ? undefined : eventType,
  })

  const logsData = logsQuery.data?.data
  const logsLoading = logsQuery.isLoading

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load monitoring data</AlertTitle>
          <AlertDescription>
            Please check that the backend is running and you have the required
            permissions.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Logs"
          value={stats.totalLogs || 0}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Errors"
          value={stats.errorCount || 0}
          icon={Bug}
          color="bg-red-500"
        />
        <StatCard
          title="Security Events"
          value={stats.securityEventCount || 0}
          icon={Lock}
          color="bg-amber-500"
        />
        <StatCard
          title="HTTP Requests"
          value={stats.httpRequestCount || 0}
          icon={Zap}
          color="bg-violet-500"
        />
      </div>

      <div className="grid shrink-0 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader title="Application Health" icon={Server} />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="relative size-32 shrink-0">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-square size-full"
                  >
                    <PieChart>
                      <Tooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={healthChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {healthChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold tabular-nums">
                      {totalComponents}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      total
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <StatusBadge status={healthStatus} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-sm">{healthyCount} healthy</span>
                    </div>
                    {unhealthyCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-red-500" />
                        <span className="text-sm">
                          {unhealthyCount} unhealthy
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <SectionHeader title="Log Statistics" icon={Activity} />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <StatBar
                  label="Errors"
                  value={stats.errorCount || 0}
                  total={stats.totalLogs || 1}
                  color="bg-red-500"
                />
                <StatBar
                  label="Warnings"
                  value={stats.warnCount || 0}
                  total={stats.totalLogs || 1}
                  color="bg-amber-500"
                />
                <StatBar
                  label="Info"
                  value={stats.infoCount || 0}
                  total={stats.totalLogs || 1}
                  color="bg-blue-500"
                />
                <div className="mt-1 border-t pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat
                      label="HTTP Requests"
                      value={stats.httpRequestCount || 0}
                    />
                    <MiniStat
                      label="Security"
                      value={stats.securityEventCount || 0}
                    />
                    <MiniStat
                      label="Audit"
                      value={stats.auditEventCount || 0}
                    />
                    <MiniStat
                      label="Error Events"
                      value={stats.errorEventCount || 0}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LogFilters
        eventType={eventType}
        onEventTypeChange={setEventType}
        query={query}
        onQueryChange={setQuery}
      />
      <MonitoringTable
        columns={allLogsColumns}
        data={logsData}
        isLoading={logsLoading}
        isError={logsQuery.isError}
        onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
      />
    </div>
  )
}

export default MonitoringOverview
