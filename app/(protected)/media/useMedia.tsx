"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { IMedia } from "./media.type"

interface MediaContextType {
  selectedMedia: IMedia[]
  toggle: (media: IMedia) => void
  clear: () => void
  isSelected: (id: string) => boolean
  setMany: (items: IMedia[]) => void
}

const MediaContext = createContext<MediaContextType | null>(null)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [selectedMedia, setSelectedMedia] = useState<IMedia[]>([])

  const toggle = useCallback((media: IMedia) => {
    setSelectedMedia((prev) => {
      const exists = prev.some((item) => item._id === media._id)

      if (exists) {
        return prev.filter((item) => item._id !== media._id)
      }

      return [...prev, media]
    })
  }, [])

  const clear = useCallback(() => {
    setSelectedMedia([])
  }, [])

  const setMany = useCallback((items: IMedia[]) => {
    setSelectedMedia(items)
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedMedia.some((item) => item._id === id),
    [selectedMedia]
  )

  return (
    <MediaContext.Provider
      value={{
        selectedMedia,
        toggle,
        clear,
        isSelected,
        setMany,
      }}
    >
      {children}
    </MediaContext.Provider>
  )
}

export function useMedia() {
  const context = useContext(MediaContext)

  if (!context) {
    throw new Error("useMedia must be used within MediaProvider")
  }

  return context
}
