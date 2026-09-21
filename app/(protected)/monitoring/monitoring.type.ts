export interface MonitoringOverview {
  health: {
    status: string
    details: Record<string, unknown>
  }
  stats: {
    totalLogs: number
    errorCount: number
    warnCount: number
    infoCount: number
    httpRequestCount: number
    securityEventCount: number
    auditEventCount: number
    errorEventCount: number
  }
}

export interface MonitoringLogsResponse {
  data: LogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface HealthCheckResult {
  status: string
  details: Record<string, unknown>
}

export interface LogQuery {
  level?: string
  event?: string
  startDate?: string
  endDate?: string
  requestId?: string
  userId?: string
  method?: string
  path?: string
  statusCode?: number
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

export interface LogEntry {
  timestamp: string
  level: string
  event: string
  message?: string
  [key: string]: unknown
}
