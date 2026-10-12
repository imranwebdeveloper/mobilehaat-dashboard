"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { parseWorkflowJson, type WorkflowImport } from "./workflowImport"

interface WorkflowImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // True when the form already holds content (edit mode or typed values),
  // so applying asks for confirmation before overwriting it.
  hasContent: boolean
  onApply: (data: WorkflowImport) => Promise<void>
}

const formatPrice = (price?: number | null) =>
  typeof price === "number" ? `৳${price.toLocaleString("en-US")}` : "—"

export function WorkflowImportDialog({
  open,
  onOpenChange,
  hasContent,
  onApply,
}: WorkflowImportDialogProps) {
  const [text, setText] = useState("")
  const [isApplying, setIsApplying] = useState(false)

  const result = text.trim() ? parseWorkflowJson(text) : null
  const data = result?.data

  const handleFile = async (file?: File) => {
    if (!file) return
    setText(await file.text())
  }

  const handleOpenChange = (next: boolean) => {
    if (isApplying) return
    if (!next) setText("")
    onOpenChange(next)
  }

  const apply = async () => {
    if (!data) return
    if (
      hasContent &&
      !window.confirm(
        "This form already has content. Replace it with the imported guide? Nothing is saved until you click Create/Update."
      )
    ) {
      return
    }
    setIsApplying(true)
    try {
      await onApply(data)
      setText("")
      onOpenChange(false)
    } finally {
      setIsApplying(false)
    }
  }

  const missingPhones = data?.cms.rankings.filter((r) => !r.phone_db_id) || []
  const hasWarnings =
    !!data && (data.blocking.length > 0 || missingPhones.length > 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Workflow JSON</DialogTitle>
          <DialogDescription>
            Choose the workflow&apos;s 08_publish.json (or paste it, or just its
            &quot;cms&quot; object). Every field except the thumbnail is filled
            in; nothing is saved until you click Create/Update.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept=".json,application/json,text/plain"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="text-sm"
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            '{\n  "workflow_id": "…",\n  "cms": { "title": "…", "rankings": [ … ] }\n}'
          }
          className="min-h-40 font-mono text-xs"
        />

        {result?.error && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}

        {data && (
          <div className="space-y-3 rounded-md border p-3 text-sm">
            <div>
              <p className="font-medium">{data.cms.title}</p>
              {data.cms.slug && (
                <p className="text-xs text-muted-foreground">
                  /{data.cms.slug}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
              <span>Rankings: {data.cms.rankings.length}</span>
              <span>FAQ: {data.cms.faq?.length || 0}</span>
              <span>
                Price: {formatPrice(data.cms.min_price)} –{" "}
                {formatPrice(data.cms.max_price)}
              </span>
              {data.cms.author && <span>Author: {data.cms.author}</span>}
              {data.cms.status && <span>Status: {data.cms.status}</span>}
              {data.qcVerdict && <span>QC: {data.qcVerdict}</span>}
              {data.publishStatus && (
                <span className="col-span-2 sm:col-span-3">
                  Publish status: {data.publishStatus}
                </span>
              )}
            </div>

            <ol className="space-y-0.5 text-xs">
              {data.cms.rankings.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-6 shrink-0 text-muted-foreground">
                    #{r.rank}
                  </span>
                  <span className="flex-1 truncate">
                    {r.phone_title || r.phone_slug || "Untitled phone"}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(r.page_price?.price)}
                  </span>
                  {!r.phone_db_id && (
                    <span className="text-destructive">no DB id</span>
                  )}
                </li>
              ))}
            </ol>

            {hasWarnings && (
              <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                <p className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Warnings
                </p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {data.blocking.map((b, i) => (
                    <li key={`b-${i}`}>{b}</li>
                  ))}
                  {missingPhones.map((r, i) => (
                    <li key={`m-${i}`}>
                      #{r.rank} {r.phone_title || r.phone_slug}: no phone_db_id.
                      A lookup by slug is tried on import; if it fails the phone
                      is left empty for you to pick.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.backups.length > 0 && (
              <div className="text-xs">
                <p className="mb-0.5 text-muted-foreground">
                  Backups (not imported):
                </p>
                <ul className="space-y-0.5">
                  {data.backups.map((b, i) => (
                    <li key={i} className="flex gap-2 text-muted-foreground">
                      <span className="w-6 shrink-0">{b.rank}</span>
                      <span className="flex-1 truncate">
                        {b.phone_title || b.phone_slug}
                      </span>
                      <span>{formatPrice(b.page_price?.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isApplying}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!data || isApplying} onClick={apply}>
            {isApplying ? "Importing..." : "Fill form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
