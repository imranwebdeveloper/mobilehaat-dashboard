"use client"
import { ModalProvider } from "@/hooks/useModalContext"
import { QueryProvider } from "@/hooks/useQueryContext"
import React from "react"
import { MediaProvider } from "./useMedia"

const MediaProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ModalProvider>
      <QueryProvider>
        <MediaProvider>{children}</MediaProvider>
      </QueryProvider>
    </ModalProvider>
  )
}

export default MediaProviderWrapper
