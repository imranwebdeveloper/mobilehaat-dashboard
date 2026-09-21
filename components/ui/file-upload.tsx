"use client"

import { useRef, useState, useCallback } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"
import {
  useUploadUserMediaMutation,
  useDeleteUserMediaMutation,
} from "@/app/(protected)/user-media/user-media.api"
import { IUserMedia } from "@/app/(protected)/user-media/user-media.type"

interface FileUploadProps {
  value?: string | null
  onChange: (id: string) => void
  purpose?: string
  accept?: string
  label?: string
  description?: string
  disabled?: boolean
  className?: string
  existingUrl?: string | null
}

export function FileUpload({
  value,
  onChange,
  purpose = "GENERAL",
  accept = "image/*",
  label = "Click or drag file here",
  description = "JPG, PNG, or WebP",
  disabled = false,
  className,
  existingUrl,
}: FileUploadProps) {
  const [uploadUserMedia, { isLoading: isUploading }] =
    useUploadUserMediaMutation()
  const [deleteUserMedia] = useDeleteUserMediaMutation()

  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = previewUrl || existingUrl
  const mediaId = value || ""

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      const file = files[0]

      setError(null)
      try {
        const formData = new FormData()
        formData.append("files", file)
        formData.append("purpose", purpose)

        const result = await uploadUserMedia(formData).unwrap()
        const media: IUserMedia = result.data?.[0]
        if (media?._id) {
          onChange(media._id)
          setPreviewUrl(media.url)
        }
      } catch {
        setError("Upload failed. Please try again.")
        setTimeout(() => setError(null), 3000)
      } finally {
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [purpose, onChange, uploadUserMedia]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    )
    handleFiles(files)
  }

  const remove = async () => {
    if (!mediaId) return
    setRemoving(true)
    try {
      await deleteUserMedia(mediaId).unwrap()
      onChange("")
      setPreviewUrl(null)
    } catch {
      setError("Failed to delete file. Please try again.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {mediaId && displayUrl ? (
        <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="relative aspect-video flex items-center justify-center bg-slate-50">
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={removing || disabled}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
          >
            {removing ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            disabled
              ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
              : dragOver
                ? "cursor-pointer border-blue-400 bg-blue-50"
                : "cursor-pointer border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
          }`}
        >
          {isUploading ? (
            <Loader2 className="size-8 text-blue-500 animate-spin" />
          ) : (
            <Upload className="size-8 text-slate-400" />
          )}
          <p className="text-sm font-medium text-slate-700">
            {isUploading ? "Uploading..." : label}
          </p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  )
}
