"use client"

import React, { useRef, useMemo, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { IMedia } from "@/app/(protected)/media/media.type"
import { MediaPicker } from "@/app/(protected)/media/MediaPicker"

// Dynamic import to avoid SSR issues with Jodit
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
})

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  placeholder?: string
}

export function JodiRichTextEditor({
  content,
  onChange,
  placeholder = "",
}: RichTextEditorProps) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const editor = useRef<any>(null)
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const [isMediaOpen, setIsMediaOpen] = useState(false)

  const isLoaded = useRef<boolean>(false)

  useEffect(() => {
    if (editor.current && content && !isLoaded.current) {
      editor.current.value = content
      isLoaded.current = true
    }
  }, [content])

  const handleInsertMedia = (media: Partial<IMedia>) => {
    if (!media.url || !editor.current) return

    const caption = media.alt || media.name || "Image caption"

    if (media.mime_type?.startsWith("image")) {
      const imageHtml = `
      <figure style="max-width:100%;height:auto;">
        <img
          src="${media.url}"
          alt="${caption}"
          title="${caption}"
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
          style="max-width:100%;height:auto;"
        />
        <figcaption style="max-width:100%;height:auto; font-style:italic; font-size:0.8em ">${caption}</figcaption>
      </figure>
    `

      editor.current.selection.insertHTML(imageHtml)
    } else if (media.mime_type?.startsWith("video")) {
      const videoHtml = `
      <figure>
        <video
          controls
          preload="metadata"
          style="max-width:100%;height:auto;"
        >
          <source src="${media.url}" type="${media.mime_type}" />
          Your browser does not support the video tag.
        </video>
        <figcaption>${caption}</figcaption>
      </figure>
    `

      editor.current.selection.insertHTML(videoHtml)
    }

    onChange(editor.current.value)
  }

  // Jodit configuration
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      height: 500,
      width: "100%",
      enableDragAndDropFileToEditor: true,
      uploader: {
        insertImageAsBase64URI: true,
      },
      controls: {
        addMedia: {
          name: "addMedia",
          text: "Media",
          tooltip: "Insert Media from Gallery",
          exec: () => {
            setIsMediaOpen(true)
          },
        },
      },
      buttons: [
        "source",
        "|",
        "bold",
        "strikethrough",
        "underline",
        "italic",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "addMedia",
        "video",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "symbol",
        "fullsize",
        "print",
        "about",
        "\n", // line break in toolbar
        "superscript",
        "subscript",
        "cut",
        "copy",
        "paste",
        "selectall",
        "|",
        "find",
        "preview",
      ],
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: true,
      spellcheck: true,
      allowResizeX: false,
      allowResizeY: true,
      toolbarAdaptive: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_as_html" as const,
      theme: "default",
      imageDefaultWidth: 600,
      // Disable sanitization that might strip images or styles when loading existing content
      cleanHTML: {
        removeEmptyElements: false,
      },
      allowTags: {
        img: true,
        figure: true,
        figcaption: true,
      },
      observer: {
        timeout: 100,
      },
      extraAllowedAttributes: {
        img: ["src", "alt", "width", "height", "style", "class"],
        video: [
          "src",
          "controls",
          "autoplay",
          "loop",
          "muted",
          "style",
          "class",
        ],
        source: ["src", "type"],
        p: ["style", "class"],
        span: ["style", "class"],
        div: ["style", "class"],
      },
    }),
    [placeholder]
  )

  return (
    <div
      id={"jodit-custom-editor"}
      className={"jodit-editor-wrapper my-reset rounded-lg"}
    >
      <link
        rel="stylesheet"
        href="https://unpkg.com/jodit@4.1.57/es2015/jodit.min.css"
      />
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onChange={(newContent) => onChange(newContent)}
        id="jodit-custom-editor-id"
        name="jodit-custom-editor-id"
      />
      {/* Kept for backward compatibility */}
      {/* <input
        type="file"
        id="jodit-media-input"
        className="hidden"
        accept="image/*,video/*"
        onChange={handleFileUpload}
      /> */}

      <MediaPicker
        headless={true}
        open={isMediaOpen}
        onOpenChange={(open) => {
          setIsMediaOpen(open)
        }}
        onChange={(media) => {
          if (media) {
            handleInsertMedia(media as IMedia)
          }
        }}
      />
    </div>
  )
}

// ;<style jsx global>{`
//   /* Optional overrides */
//   .jodit-container {
//     border-radius: 1rem;
//     border-color: hsl(var(--input));
//   }

//   /* Completely remove the icon for Add Media */
//   .jodit_toolbar_btn-addMedia .jodit-toolbar-button__icon,
//   .jodit_toolbar_btn-addMedia svg {
//     display: none !important;
//     width: 0 !important;
//   }

//   /* Show ONLY text for Add Media button */
//   .jodit_toolbar_btn-addMedia .jodit-toolbar-button__text {
//     display: inline-block !important;
//     font-size: 13px;
//     font-weight: 600;
//     margin: 0 !important;
//     line-height: 1;
//     color: inherit;
//   }

//   .jodit_toolbar_btn-addMedia {
//     width: auto !important;
//     padding: 0 8px !important;
//     display: flex !important;
//     align-items: center !important;
//     justify-content: center !important;
//     min-width: 80px; /* Optional: give it some presence */
//   }

//   /* Ensure all images inside the editor are properly displayed and responsive */
// `}</style>
