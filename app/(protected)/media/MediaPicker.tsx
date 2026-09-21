"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import MediaGalleryWrapper from "./MediaGalleryWrapper"
import MediaProviderWrapper from "./MediaProviderWrapper"
import { useMedia } from "./useMedia"
import { IMedia } from "./media.type"
import { useState } from "react"
import { Plus, X } from "lucide-react"

interface Props {
  multiple?: boolean
  value?: IMedia | IMedia[]
  onChange: (media: IMedia | IMedia[] | undefined) => void
  placeholder?: string
  headless?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const MediaPicker = ({
  multiple,
  value,
  onChange,
  placeholder,
  headless,
  open,
  onOpenChange,
}: Props) => {
  return (
    <MediaProviderWrapper>
      <FormModal
        multiple={multiple}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        headless={headless}
        open={open}
        onOpenChange={onOpenChange}
      />
    </MediaProviderWrapper>
  )
}

function FormModal({
  multiple,
  value,
  onChange,
  placeholder = "Add Image",
  headless = false,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const { selectedMedia, clear } = useMedia()

  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = headless

  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  const images = Array.isArray(value) ? value : value ? [value] : []

  const handleRemove = (id: string) => {
    if (multiple) {
      onChange(images.filter((img) => img._id !== id))
    } else {
      onChange(undefined)
    }
  }

  const handleSelect = () => {
    if (multiple) {
      const current = Array.isArray(value) ? value : []

      const merged = [...current, ...selectedMedia]

      const unique = merged.filter(
        (item, index, self) =>
          index === self.findIndex((m) => m._id === item._id)
      )

      onChange(unique)
    } else {
      onChange(selectedMedia[0])
    }

    clear()
    setOpen(false)
  }

  const handleClose = () => {
    clear()
    setOpen(false)
  }

  const selectedCount = selectedMedia.length
  const isSelected = selectedCount > 0

  const getSelectLabel = () => {
    if (multiple) {
      return isSelected
        ? `Select ${selectedCount} Image${selectedCount > 1 ? "s" : ""}`
        : "Select Images"
    }

    return "Select Image"
  }

  return (
    <div>
      {!headless && (
        <div className="flex flex-wrap gap-1">
          {(multiple || images.length === 0) && (
            <button
              onClick={() => setOpen(true)}
              type="button"
              className="flex h-32 w-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition hover:border-primary hover:bg-muted"
            >
              <Plus size={20} />
              <span className="mt-1 text-xs">{placeholder}</span>
            </button>
          )}

          <Preview images={images} onRemove={handleRemove} />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <DialogContent
          showCloseButton={false}
          className="h-full max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[90vw]"
        >
          <div className="h-full overflow-auto lg:overflow-hidden">
            <MediaGalleryWrapper isModalView />
          </div>

          <DialogFooter className="p-4 px-6">
            <Button
              variant="outline"
              className="px-6"
              size="lg"
              onClick={handleClose}
              type="button"
            >
              Close
            </Button>

            <Button
              onClick={handleSelect}
              className="px-6"
              size="lg"
              disabled={!isSelected}
              type="button"
            >
              {getSelectLabel()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Preview({
  images,
  onRemove,
}: {
  images: IMedia[]
  onRemove: (id: string) => void
}) {
  const getPreviewKey = (img: IMedia, index: number) =>
    img._id || img.url || `preview-${index}`

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((img, index) => (
        <div
          key={getPreviewKey(img, index)}
          className="group relative h-32 w-32 overflow-hidden rounded-lg border bg-muted"
        >
          <Image
            src={img?.url || ""}
            alt=""
            fill
            className="object-contain transition-transform duration-200 group-hover:scale-105"
          />

          {/* Remove Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(img._id || "")
            }}
            variant={"destructive"}
            size={"icon-xs"}
            className="absolute top-1 right-1 z-2 opacity-0 transition group-hover:opacity-100"
          >
            <X size={14} />
          </Button>
        </div>
      ))}
    </div>
  )
}
