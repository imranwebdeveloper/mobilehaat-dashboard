"use client"

import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"
import { format } from "date-fns"
import { useMemo, useState, useCallback, useEffect } from "react"
import { X, Calendar, FileText, HardDrive, Maximize2, Copy } from "lucide-react"
import { toast } from "sonner"

import { IMedia } from "./media.type"
import { mediaApi } from "./media.api"
import { useModalContext } from "@/hooks/useModalContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loading from "@/components/ui/loading"
import { Textarea } from "@/components/ui/textarea"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"

/* -------------------------------- Utils -------------------------------- */

const formatSize = (bytes: number) => {
  if (!bytes) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/* ------------------------------ MediaPreview ----------------------------- */

function MediaPreview({ item }: { item: IMedia }) {
  if (item.resource_type === "video") {
    return (
      <video
        src={item.url}
        controls
        className="max-h-full max-w-full rounded-lg"
      />
    )
  }

  return (
    <div className="relative h-96 w-full">
      <Image
        src={item.url}
        alt={item.alt || item.name}
        fill
        className="max-h-full max-w-full rounded-lg object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}

/* ---------------------------- Main Component ----------------------------- */

export function MediaDetailsModal() {
  const { itemId, action, resetAction } = useModalContext()

  const { data, isLoading, isError } = mediaApi.useGetMediaByIdQuery(
    itemId as string,
    {
      skip: !itemId || action !== "view",
    }
  )

  const [updateMedia, { isLoading: isUpdating }] =
    mediaApi.useUpdateMediaMutation()

  const item = data?.data

  const [edits, setEdits] = useState<Record<string, string>>({})

  useEffect(() => {
    setEdits({})
  }, [itemId])

  const form = useMemo(
    () => ({
      name: edits.name ?? item?.name ?? "",
      alt: edits.alt ?? item?.alt ?? "",
    }),
    [item, edits]
  )

  /* ------------------------------ Handlers ------------------------------- */

  const handleChange = useCallback((field: keyof IMedia, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleUpdate = useCallback(async () => {
    if (!item) return

    try {
      await updateMedia({
        id: item._id,
        body: form,
      }).unwrap()

      toast.success("Media updated successfully")
      resetAction()
    } catch {
      toast.error("Failed to update media")
    }
  }, [form, item, updateMedia, resetAction])

  const handleCopyUrl = useCallback(async () => {
    if (!item?.url) return

    try {
      await navigator.clipboard.writeText(item.url)
      toast.success("Media URL copied")
    } catch {
      toast.error("Failed to copy URL")
    }
  }, [item])

  /* -------------------------------- Render ------------------------------- */

  return (
    <Dialog.Root
      open={action === "view"}
      onOpenChange={(open) => !open && resetAction()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Title className="fixed -top-100">
          {/* Media Details */}
        </Dialog.Title>
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex h-[90vh] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-background shadow-2xl md:flex-row">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loading />
            </div>
          ) : isError || !item ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Failed to load media details. Please try again.
              </p>
              <Button variant="destructive" onClick={resetAction}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="relative flex flex-1 items-center justify-center bg-muted/50 p-4">
                <MediaPreview item={item} />
              </div>

              {/* Sidebar */}
              <div className="flex w-full flex-col border-l md:w-[400px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                  <h2 className="text-xl font-bold">Attachment Details</h2>

                  <button
                    onClick={resetAction}
                    className="hidden rounded-full p-2 hover:bg-muted md:block"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-8 overflow-y-auto p-6">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <MetaItem
                      icon={<Calendar className="h-3 w-3" />}
                      label="Uploaded"
                      value={format(new Date(item.createdAt), "MMM d, yyyy")}
                    />

                    <MetaItem
                      icon={<HardDrive className="h-3 w-3" />}
                      label="File size"
                      value={formatSize(item.size)}
                    />

                    <MetaItem
                      icon={<Maximize2 className="h-3 w-3" />}
                      label="Dimensions"
                      value={`${item.width} × ${item.height}`}
                    />

                    <MetaItem
                      icon={<FileText className="h-3 w-3" />}
                      label="File type"
                      value={
                        (item.mime_type || "unknown")
                          ?.toUpperCase()
                          ?.split("/")[1]
                      }
                    />
                  </div>

                  <hr />

                  {/* Form */}
                  <div className="space-y-6">
                    {/* URL Copy */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">
                        File URL
                      </label>

                      <div className="flex gap-2">
                        <Input value={item.url} readOnly className="text-xs" />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyUrl}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">
                        Name
                      </label>

                      <Input
                        value={form.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">
                        Alt Text
                      </label>

                      <Textarea
                        placeholder="Describe the image"
                        value={form.alt || ""}
                        onChange={(e) => handleChange("alt", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 bg-muted/20 p-4">
                  <Button
                    size="lg"
                    variant={"destructive"}
                    className="flex-1 px-8"
                    onClick={resetAction}
                  >
                    Close
                  </Button>
                  <Permission permission={Permissions.MEDIA_UPDATE}>
                    <Button
                      size="lg"
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex-1 px-8"
                    >
                      Save
                    </Button>
                  </Permission>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ----------------------------- Meta Component ---------------------------- */

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold tracking-wider uppercase">
          {label}
        </span>
      </div>

      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
