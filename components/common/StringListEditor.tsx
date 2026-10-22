"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface StringListEditorProps {
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  addLabel?: string
  emptyText?: string
  className?: string
}

export default function StringListEditor({
  value = [],
  onChange,
  placeholder = "Enter text...",
  addLabel = "Add item",
  emptyText = "No items added yet.",
  className,
}: StringListEditorProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])
  const focusIndexRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const index = focusIndexRef.current
    if (index !== null) {
      inputRefs.current[index]?.focus()
      focusIndexRef.current = null
    }
  })

  const updateAt = (index: number, text: string) => {
    if (!onChange) return
    onChange(value.map((item, i) => (i === index ? text : item)))
  }

  const removeAt = (index: number) => {
    if (!onChange) return
    onChange(value.filter((_, i) => i !== index))
  }

  const focusExisting = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const addAfter = (index?: number) => {
    if (!onChange) return

    if (index === undefined) {
      const lastIdx = value.length - 1
      if (lastIdx >= 0 && value[lastIdx].trim() === "") {
        focusExisting(lastIdx)
        return
      }
      onChange([...value, ""])
      focusIndexRef.current = value.length
      return
    }

    // Enter on a blank row: no-op (still prevented from submitting the form)
    if (value[index].trim() === "") return

    const nextIdx = index + 1
    // Reuse an already-blank next row instead of stacking empties
    if (nextIdx < value.length && value[nextIdx].trim() === "") {
      focusExisting(nextIdx)
      return
    }

    const next = [...value]
    next.splice(nextIdx, 0, "")
    onChange(next)
    focusIndexRef.current = nextIdx
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Enter") {
      event.preventDefault()
      addAfter(index)
    }
  }

  const handleBlur = (index: number) => {
    const current = value[index]
    if (current === undefined) return
    const trimmed = current.trim()
    if (trimmed === current) return
    onChange?.(value.map((item, i) => (i === index ? trimmed : item)))
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                ref={(node) => {
                  inputRefs.current[index] = node
                }}
                value={item}
                placeholder={placeholder}
                onChange={(event) => updateAt(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onBlur={() => handleBlur(index)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove item ${index + 1}`}
                onClick={() => removeAt(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addAfter()}
      >
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  )
}
