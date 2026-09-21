"use client"

import Image from "next/image"
import { useGetMediaByIdQuery } from "@/app/(protected)/media/media.api"
import { IMedia } from "@/app/(protected)/media/media.type"
import { FileIcon } from "lucide-react"
import Link from "next/link"

/* Single attachment — renders its own query */
export const AttachmentPreview = ({
  id,
  className,
}: {
  id: string
  className?: string
}) => {
  const { data, isLoading } = useGetMediaByIdQuery(id)

  if (isLoading) {
    return (
      <div
        className={`flex aspect-square w-full animate-pulse items-center justify-center rounded-lg bg-muted ${className ?? ""}`}
      />
    )
  }

  const media = data?.data
  if (!media) return null

  return (
    <Link
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-lg border bg-muted/30 transition-colors hover:border-primary/30 ${className ?? ""}`}
    >
      {media.mime_type?.startsWith("image/") ? (
        <Image
          src={media.url}
          alt={media.name || "Attachment"}
          width={120}
          height={120}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center">
          <FileIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
        <p className="truncate text-[10px] font-medium text-white">
          {media.name}
        </p>
      </div>
    </Link>
  )
}

/* Multiple attachments grid */
export const AttachmentGrid = ({
  ids,
  maxColumns = 3,
}: {
  ids?: string[]
  maxColumns?: number
}) => {
  if (!ids?.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Attachments ({ids.length})
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))` }}
      >
        {ids.map((id) => (
          <AttachmentPreview key={id} id={id} />
        ))}
      </div>
    </div>
  )
}

/* Compact attachments for dialog (smaller) */
export const AttachmentPreviews = ({
  ids,
}: {
  ids?: string[]
}) => {
  if (!ids?.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Seller Attachments ({ids.length})
      </p>
      <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
        {ids.map((id) => (
          <AttachmentPreview key={id} id={id} />
        ))}
      </div>
    </div>
  )
}
