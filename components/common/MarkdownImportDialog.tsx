"use client"

import { useState } from "react"
import { marked } from "marked"
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

interface MarkdownImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (html: string, mode: "insert" | "replace") => void
}

// Converts a markdown article (e.g. the content workflow's 08_article.md) to
// HTML. GFM is on, so pipe tables become real <table> elements. A leading
// "# Title" line is dropped because the post title is already the page H1.
export function markdownToHtml(markdown: string): string {
  const body = markdown.replace(/^﻿?\s*#\s+[^\n]*\n+/, "")
  return marked.parse(body, { gfm: true, breaks: false, async: false }) as string
}

export function MarkdownImportDialog({
  open,
  onOpenChange,
  onInsert,
}: MarkdownImportDialogProps) {
  const [markdown, setMarkdown] = useState("")

  const handleFile = async (file?: File) => {
    if (!file) return
    setMarkdown(await file.text())
  }

  const submit = (mode: "insert" | "replace") => {
    if (!markdown.trim()) return
    onInsert(markdownToHtml(markdown), mode)
    setMarkdown("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Markdown</DialogTitle>
          <DialogDescription>
            Paste markdown or choose a .md file. Headings, lists, links,
            bold/italic and tables are converted to HTML.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="text-sm"
        />
        <Textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder={"## Heading\n\nParagraph text…\n\n| Variant | Price |\n|---|---|\n| 8/256 | ৳45,999 |"}
          className="min-h-72 font-mono text-xs"
        />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!markdown.trim()}
            onClick={() => submit("insert")}
          >
            Insert at cursor
          </Button>
          <Button
            type="button"
            disabled={!markdown.trim()}
            onClick={() => submit("replace")}
          >
            Replace all content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
