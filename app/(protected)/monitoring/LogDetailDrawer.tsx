"use client"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogRow } from "./MonitoringTable"
import { levelVariant, typeVariant } from "./logColumns"

const LogDetailDrawer = ({
  row,
  open,
  onOpenChange,
}: {
  row: LogRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const entries = row ? Object.entries(row) : []
  const type = row ? String(row._type || "") : ""
  const level = row ? String(row.level || "") : ""
  const event = row ? String(row.event || "") : ""

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle className="flex items-center gap-2">
            {type && (
              <Badge variant={typeVariant(type)} className="capitalize">
                {type}
              </Badge>
            )}
            {level && (
              <Badge variant={levelVariant(level)} className="capitalize">
                {level}
              </Badge>
            )}
            {event && (
              <span className="text-sm text-muted-foreground">
                {event}
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="grid gap-3 p-6 sm:grid-cols-2">
            {entries.map(([key, value]) => {
              const displayValue =
                value === null || value === undefined
                  ? "—"
                  : typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value ?? "—")

              return (
                <div
                  key={key}
                  className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  {typeof value === "object" && value !== null ? (
                    <pre className="break-all font-mono text-sm whitespace-pre-wrap">
                      {displayValue}
                    </pre>
                  ) : (
                    <span className="break-all font-mono text-sm">
                      {displayValue}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default LogDetailDrawer
