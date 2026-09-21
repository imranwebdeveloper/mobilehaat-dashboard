"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, LayoutTemplate } from "lucide-react"

interface FooterLink {
  text: string
  url: string
}

interface FooterColumn {
  title: string
  content?: string
  links?: FooterLink[]
}

interface FooterColumnsEditorProps {
  value: Record<string, FooterColumn>
  onChange: (value: Record<string, FooterColumn>) => void
}

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

export const FooterColumnsEditor = ({
  value,
  onChange,
}: FooterColumnsEditorProps) => {
  const updateColumn = (key: string, updates: Partial<FooterColumn>) => {
    onChange({ ...value, [key]: { ...value[key], ...updates } })
  }

  const addLink = (key: string) => {
    const col = value[key]
    const links = [...(col.links || []), { text: "", url: "" }]
    updateColumn(key, { links })
  }

  const removeLink = (key: string, index: number) => {
    const col = value[key]
    const links = (col.links || []).filter((_, i) => i !== index)
    updateColumn(key, { links })
  }

  const updateLink = (
    key: string,
    index: number,
    updates: Partial<FooterLink>
  ) => {
    const col = value[key]
    const links = (col.links || []).map((link, i) =>
      i === index ? { ...link, ...updates } : link
    )
    updateColumn(key, { links })
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-2">
        <LayoutTemplate size={16} />
        <Label>Footer Columns</Label>
      </div>

      <div className="space-y-5">
        {Object.entries(value).map(([key, col]) => (
          <div
            key={key}
            className="space-y-4 rounded-lg border bg-background p-4"
          >
            <Label>Section: {formatLabel(key)}</Label>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={col.title}
                onChange={(e) => updateColumn(key, { title: e.target.value })}
                className="h-9 rounded-md"
              />
            </div>

            {col.content !== undefined && (
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={col.content}
                  onChange={(e) =>
                    updateColumn(key, { content: e.target.value })
                  }
                  className="min-h-[80px] rounded-md"
                />
              </div>
            )}

            {col.links !== undefined && (
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Label>Link Text</Label>
                  <Label>URL</Label>
                  <span />
                </div>

                <div className="space-y-2">
                  {col.links.map((link, index) => (
                    <div
                      key={`${key}-${index}`}
                      className="grid grid-cols-[1fr_1fr_auto] gap-1.5"
                    >
                      <Input
                        value={link.text}
                        placeholder="Label"
                        onChange={(e) =>
                          updateLink(key, index, { text: e.target.value })
                        }
                        className="h-8 rounded-md"
                      />
                      <Input
                        value={link.url}
                        placeholder="URL"
                        onChange={(e) =>
                          updateLink(key, index, { url: e.target.value })
                        }
                        className="h-8 rounded-md"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLink(key, index)}
                        className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLink(key)}
                  className="h-8 rounded-md"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Link
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
