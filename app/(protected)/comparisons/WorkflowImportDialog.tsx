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
import {
  parseComparisonWorkflowJson,
  type ComparisonWorkflowImport,
} from "./workflowImport"

interface WorkflowImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // True when the form already holds content (edit mode or typed values),
  // so applying asks for confirmation before overwriting it.
  hasContent: boolean
  onApply: (data: ComparisonWorkflowImport) => Promise<void>
}

export function WorkflowImportDialog({
  open,
  onOpenChange,
  hasContent,
  onApply,
}: WorkflowImportDialogProps) {
  const [text, setText] = useState("")
  const [isApplying, setIsApplying] = useState(false)

  const result = text.trim() ? parseComparisonWorkflowJson(text) : null
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
        "This form already has content. Replace it with the imported comparison? Nothing is saved until you click Create/Update."
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

  const qcNotPass = !!data?.qcVerdict && data.qcVerdict !== "PASS"
  const hasWarnings =
    !!data &&
    (qcNotPass ||
      data.checkErrors.length > 0 ||
      data.followups.length > 0 ||
      data.phones.some((p) => !p.db_id))
  const overall = data?.cms.scores?.overall

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Workflow JSON</DialogTitle>
          <DialogDescription>
            Choose the comparison workflow&apos;s 06_publish.json (or paste it,
            or just its &quot;cms&quot; object). Every field except the
            thumbnail is filled in; nothing is saved until you click
            Create/Update.
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
            '{\n  "run_id": "…",\n  "cms": { "title": "…", "phones": [ … ] }\n}'
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
                  /compare-list/{data.cms.slug}
                </p>
              )}
            </div>

            <ol className="space-y-0.5 text-xs">
              {data.phones.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">
                    Phone {i === 0 ? "A" : "B"}
                  </span>
                  <span className="flex-1 truncate">
                    {p.title || p.slug || p.db_id}
                  </span>
                  {!p.db_id && (
                    <span className="text-destructive">no DB id</span>
                  )}
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
              <span>
                Key differences: {data.cms.key_differences?.length || 0}
              </span>
              <span>FAQ: {data.cms.faqs?.length || 0}</span>
              {overall && (
                <span>
                  Overall: {overall.phone_a} / {overall.phone_b}
                </span>
              )}
              {data.cms.author && <span>Author: {data.cms.author}</span>}
              {data.cms.status && <span>Status: {data.cms.status}</span>}
              {data.qcVerdict && <span>QC: {data.qcVerdict}</span>}
              {data.mode && (
                <span className="col-span-2 sm:col-span-3">
                  Mode: {data.mode}
                  {data.updateUrl ? ` (${data.updateUrl})` : ""}
                </span>
              )}
              {data.scoresSource && (
                <span className="col-span-2 sm:col-span-3">
                  Scores: {data.scoresSource}
                </span>
              )}
            </div>

            {hasWarnings && (
              <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                <p className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Warnings
                </p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {qcNotPass && (
                    <li>QC verdict is {data.qcVerdict}, not PASS.</li>
                  )}
                  {data.checkErrors.map((e, i) => (
                    <li key={`e-${i}`}>Field check: {e}</li>
                  ))}
                  {data.followups.map((f, i) => (
                    <li key={`f-${i}`}>Phone page follow-up: {f}</li>
                  ))}
                  {data.phones
                    .filter((p) => !p.db_id)
                    .map((p, i) => (
                      <li key={`m-${i}`}>
                        {p.title || p.slug}: no db_id. A lookup by slug is tried
                        on import; if it fails, pick the phone yourself.
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
