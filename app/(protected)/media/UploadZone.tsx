/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { mediaApi } from "./media.api"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"

import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"

const MAX_FILES = 3
const MAX_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_TYPES = ["image/png", "image/webp"]

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadMedia, { isLoading }] = mediaApi.useUploadMediaMutation()

  // Validate file type, size, and max files
  const validateFiles = (files: File[]) => {
    if (previews.length + files.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} files.`)
      return false
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not allowed. Only PNG & WebP.`)
        return false
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds max size of 1MB.`)
        return false
      }
    }

    setError(null)
    return true
  }

  const handleFiles = (files: File[]) => {
    if (!validateFiles(files)) return

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleUpload = async () => {
    if (!previews.length) {
      toast.error("No files selected for upload")
      return
    }

    try {
      const formData = new FormData()
      previews.forEach(({ file }) => formData.append("files", file))
      await uploadMedia(formData).unwrap()
      toast.success("Files uploaded successfully")
      setPreviews([])
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload files")
    }
  }

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(Array.from(e.dataTransfer.files))
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200",
          isDragging
            ? "scale-[1.02] border-primary bg-primary/5"
            : "border-muted-foreground/20 bg-muted/30 hover:border-muted-foreground/40"
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-7 w-7 text-primary" />
        </div>

        <h3 className="mb-1 text-xl font-semibold">Drop files here</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          PNG & WebP only. Max 1MB. Max {MAX_FILES} files.
        </p>

        {error && (
          <p className="mb-3 text-sm font-medium text-red-600">{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files))
              e.target.value = ""
            }
          }}
        />

        <div className="flex gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
            className="px-6"
          >
            Select Files
          </Button>
          <Permission permission={Permissions.MEDIA_CREATE}>
            <Button
              onClick={handleUpload}
              disabled={previews.length === 0 || isLoading}
              size="lg"
              className="px-6"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </Permission>
        </div>

        {/* Preview Thumbnails */}
        {previews.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {previews.map(({ url }, idx) => (
              <div
                key={idx}
                className="relative h-28 w-28 overflow-hidden rounded-lg border p-1"
              >
                <Image
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
                <Button
                  onClick={() => removePreview(idx)}
                  variant="destructive"
                  size="icon-xs"
                  className="absolute top-1 right-1 rounded-full p-1"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
