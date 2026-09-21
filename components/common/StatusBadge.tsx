"use client"

import React from "react"

const statusClassMap: Record<string, string> = {
  // Core
  ACTIVE: "bg-green-500 text-white",
  INACTIVE: "bg-red-500 text-white",
  AVAILABLE: "bg-green-400 text-white",
  UNAVAILABLE: "bg-red-400 text-white",

  // Time-based
  UPCOMING: "bg-sky-500 text-white",
  SCHEDULED: "bg-orange-500 text-white",

  // General states
  PENDING: "bg-yellow-400 text-black",
  APPROVED: "bg-green-600 text-white",
  REJECTED: "bg-red-600 text-white",
  SPAM: "bg-orange-700 text-white",
  DELETED: "bg-gray-800 text-white",
  CANCELLED: "bg-rose-500 text-white",
  FAILED: "bg-red-700 text-white",
  SUCCESS: "bg-emerald-600 text-white",

  // Content / CMS
  DRAFT: "bg-gray-400 text-white",
  PUBLISHED: "bg-green-600 text-white",
  ARCHIVED: "bg-gray-600 text-white",

  // Workflow
  NEW: "bg-blue-500 text-white",
  IN_PROGRESS: "bg-indigo-500 text-white",
  REVIEW: "bg-purple-500 text-white",
  UNDER_REVIEW: "bg-purple-600 text-white",
  RESOLVED: "bg-emerald-600 text-white",
  CLOSED: "bg-gray-700 text-white",
  OPEN: "bg-blue-600 text-white",

  // Payment / Order
  PAID: "bg-green-500 text-white",
  UNPAID: "bg-red-500 text-white",
  REFUNDED: "bg-yellow-500 text-black",
  PARTIALLY_PAID: "bg-amber-500 text-black",
  PROCESSING: "bg-indigo-400 text-white",
  SHIPPED: "bg-blue-400 text-white",
  DELIVERED: "bg-green-700 text-white",
  RETURNED: "bg-rose-600 text-white",
  SUBMITTED: "bg-sky-600 text-white",
  VERIFIED: "bg-emerald-600 text-white",

  // Subscription
  EXPIRED: "bg-gray-500 text-white",
  DEFAULT: "bg-gray-300 text-gray-700",
  UPGRADE: "bg-indigo-500 text-white",
  ADMIN: "bg-purple-500 text-white",

  // User / Account
  UNVERIFIED: "bg-yellow-500 text-black",
  BLOCKED: "bg-red-700 text-white",
  SUSPENDED: "bg-orange-600 text-white",

  // System
  ENABLED: "bg-green-500 text-white",
  DISABLED: "bg-gray-500 text-white",
  ERROR: "bg-red-800 text-white",
  WARNING: "bg-yellow-600 text-black",
  INFO: "bg-blue-500 text-white",

  // Special
  NA: "bg-gray-300 text-gray-700",
  UNKNOWN: "bg-gray-200 text-gray-600",
}
interface StatusBadgeProps {
  status?: string
  is_active?: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, is_active }) => {
  let normalizedStatus = "UNKNOWN"

  if (typeof is_active === "boolean") {
    normalizedStatus = is_active ? "ACTIVE" : "INACTIVE"
  } else if (status && typeof status === "string") {
    normalizedStatus = status.toUpperCase()
  }

  const className = statusClassMap[normalizedStatus] || "bg-gray-300 text-black"

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${className}`}
    >
      {normalizedStatus.toLowerCase().replace(/_/g, " ")}
    </span>
  )
}

export default StatusBadge
