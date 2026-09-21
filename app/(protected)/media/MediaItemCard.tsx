"use client"

import { IMedia } from "./media.type"
import { Play, Trash2 } from "lucide-react"
import Image from "next/image"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useModalContext } from "@/hooks/useModalContext"
import { useMedia } from "./useMedia"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"

interface MediaItemCardProps {
  item: IMedia
}

export function MediaItemCard({ item }: MediaItemCardProps) {
  const { setAction } = useModalContext()
  const { toggle, isSelected, selectedMedia } = useMedia()
  const selected = isSelected(item._id)

  const handleDoubleClick = () => {
    setAction({
      action: "view",
      itemId: item._id,
    })
  }

  const handleDelete = () => {
    setAction({
      action: "delete",
      itemId: item._id,
      extraState: { name: item.name },
    })
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded bg-background p-3 shadow transition duration-300",
        "hover:ring-2 hover:ring-primary/40",
        selected && "ring-2 ring-primary"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.url}
          alt={item.alt || item.name}
          fill
          referrerPolicy="no-referrer"
          className="object-contain transition duration-300"
        />

        {/* Checkbox */}
        <div
          className={cn(
            "absolute top-2 left-2 z-10 transition-opacity",
            "opacity-0 group-hover:opacity-100", // show on hover
            selected && "opacity-100" // always visible if selected
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={() => toggle(item)}
            className="h-5 w-5 rounded-full bg-background"
          />
        </div>

        {/* Delete button */}
        {!selectedMedia.length && (
          <Permission permission={Permissions.MEDIA_DELETE}>
            <div className="absolute top-1 right-1 z-10 opacity-0 transition group-hover:opacity-100">
              <Button
                size="icon"
                variant="destructive"
                className="h-7 w-7"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Permission>
        )}

        {/* Video indicator */}
        {item.resource_type === "video" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/60 p-2">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        {/* Hover filename */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="truncate text-xs font-medium text-white">{item.name}</p>
        </div>
      </div>
    </div>
  )
}
