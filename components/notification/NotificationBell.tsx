"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, X } from "lucide-react"
import {
  useGetUnreadCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/hooks/notificationApi"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const typeStyles = {
  info: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  success: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
  warning: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  error: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
}

const typeIcons = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: unreadData } = useGetUnreadCountQuery()
  const { data: notifications, isLoading } = useGetNotificationsQuery(
    { limit: 10 },
    { skip: !isOpen }
  )
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()

  const unreadCount = unreadData?.count ?? 0

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await markRead(id).unwrap()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2 w-96 rounded-lg border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-medium">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleMarkAllRead}
                    className="h-7 gap-1.5 text-xs"
                  >
                    <CheckCheck className="size-3.5" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : notifications?.data.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="divide-y">
                  {notifications?.data.map((notification) => {
                    const isRead = notification.read_by.length > 0
                    return (
                      <div
                        key={notification._id}
                        className={cn(
                          "relative border-l-4 p-4 transition-colors hover:bg-muted/50",
                          typeStyles[notification.type],
                          !isRead && "bg-muted/30"
                        )}
                        onClick={() => !isRead && markRead(notification._id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-1 size-2 rounded-full",
                              typeIcons[notification.type]
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                !isRead && "text-foreground"
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                          {!isRead && (
                            <button
                              onClick={(e) =>
                                handleMarkRead(e, notification._id)
                              }
                              className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              <Check className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
