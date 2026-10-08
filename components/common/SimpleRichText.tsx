"use client"

import { useEffect, useReducer } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  RemoveFormatting,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SimpleRichTextProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: number
  className?: string
}

const normalize = (html: string) =>
  !html || html === "<p></p>" ? "" : html

/**
 * Lightweight rich-text input (bold / italic / underline / strike /
 * bullet + numbered lists / link / clear formatting), powered by Tiptap.
 *
 * Same `content` / `onChange` contract as JodiRichTextEditor, so the two
 * are interchangeable — use this one for short HTML fields (disclaimer,
 * key differences, ranking content) and Jodit for full articles.
 */
export function SimpleRichText({
  content,
  onChange,
  placeholder = "Write here...",
  minHeight = 120,
  className,
}: SimpleRichTextProps) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        Link.configure({ openOnClick: false }),
      ],
      content: content || "",
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        onChange(normalize(editor.getHTML()))
        forceUpdate()
      },
      onSelectionUpdate: () => forceUpdate(),
      editorProps: {
        attributes: {
          class: "tiptap-simple",
          style: `min-height: ${minHeight}px`,
        },
      },
    },
    []
  )

  // Push external value (form reset, edit load) into the editor —
  // but never while the user is typing in it.
  useEffect(() => {
    if (!editor) return
    if (
      normalize(content) !== normalize(editor.getHTML()) &&
      !editor.isFocused
    ) {
      editor.commands.setContent(content || "", { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground",
          className
        )}
        style={{ minHeight }}
      >
        Loading editor...
      </div>
    )
  }

  const exec = (fn: () => void) => () => {
    fn()
    editor.commands.focus()
  }

  const applyLink = () => {
    const url = window.prompt("Enter URL", "https://")
    if (!url) return
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run()
  }

  const toolBtn = (active?: boolean) =>
    cn(
      "h-8 w-8 shrink-0",
      active ? "text-foreground bg-accent" : "text-muted-foreground"
    )

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-1.5 py-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("bold"))}
          title="Bold"
          onClick={exec(() => editor.chain().focus().toggleBold().run())}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("italic"))}
          title="Italic"
          onClick={exec(() => editor.chain().focus().toggleItalic().run())}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("underline"))}
          title="Underline"
          onClick={exec(() => editor.chain().focus().toggleUnderline().run())}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("strike"))}
          title="Strikethrough"
          onClick={exec(() => editor.chain().focus().toggleStrike().run())}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("bulletList"))}
          title="Bullet list"
          onClick={exec(() =>
            editor.chain().focus().toggleBulletList().run()
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("orderedList"))}
          title="Numbered list"
          onClick={exec(() =>
            editor.chain().focus().toggleOrderedList().run()
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={toolBtn(editor.isActive("link"))}
          title="Insert link"
          onClick={applyLink}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(toolBtn(), "hover:text-foreground")}
          title="Clear formatting"
          onClick={exec(() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          )}
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        {editor.isEmpty && (
          <div className="pointer-events-none absolute top-0 left-0 px-3 py-2 text-sm text-muted-foreground">
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          className="[&_.tiptap-simple]:px-3 [&_.tiptap-simple]:py-2 [&_.tiptap-simple]:text-sm [&_.tiptap-simple]:outline-none [&_.tiptap-simple_a]:text-primary [&_.tiptap-simple_a]:underline [&_.tiptap-simple_ol]:list-decimal [&_.tiptap-simple_ol]:pl-5 [&_.tiptap-simple_p]:my-1 [&_.tiptap-simple_ul]:list-disc [&_.tiptap-simple_ul]:pl-5"
        />
      </div>
    </div>
  )
}
