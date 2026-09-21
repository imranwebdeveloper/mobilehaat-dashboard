"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Globe } from "lucide-react"

interface SEOPreviewProps {
  title: string
  description: string
  keywords: string[]
  domain: string
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onKeywordsChange: (v: string[]) => void
}

export const SEOPreview = ({
  title,
  description,
  keywords,
  domain,
  onTitleChange,
  onDescriptionChange,
  onKeywordsChange,
}: SEOPreviewProps) => {
  return (
    <div className="space-y-5 rounded-xl border bg-background p-4">
      <div className="space-y-4 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Search size={16} />
          <Label>Search Engine Preview</Label>
        </div>

        <div className="rounded-md border bg-background p-4">
          <div className="max-w-[600px] space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border">
                <Globe size={14} />
              </div>
              <div className="flex flex-col">
                <span>{domain || "https://yourdomain.com"}</span>
                <span className="text-xs text-muted-foreground">
                  {domain}/...
                </span>
              </div>
            </div>
            <h3 className="cursor-pointer text-lg font-medium hover:underline">
              {title || "Your Site Title Goes Here"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description || "Your meta description preview appears here."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meta Title</Label>
            <span
              className={`text-[10px] font-bold ${title.length > 60 ? "text-amber-500" : "text-slate-400"}`}
            >
              {title.length} / 60
            </span>
          </div>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-10 rounded-md"
            placeholder="MobileHaat - Mobile Specifications, Reviews & Comparison"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meta Description</Label>
            <span
              className={`text-[10px] font-bold ${description.length > 160 ? "text-amber-500" : "text-slate-400"}`}
            >
              {description.length} / 160
            </span>
          </div>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[96px] rounded-md"
            placeholder="Find detailed specifications, expert reviews, and compare mobile phones..."
          />
        </div>

        <div className="space-y-2">
          <Label>Keywords (Comma separated)</Label>
          <Input
            value={keywords.join(", ")}
            onChange={(e) =>
              onKeywordsChange(e.target.value.split(",").map((k) => k.trim()))
            }
            className="h-10 rounded-md"
            placeholder="mobile, smartphone, reviews"
          />
        </div>
      </div>
    </div>
  )
}
