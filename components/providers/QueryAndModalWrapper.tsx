import { ModalProvider } from "@/hooks/useModalContext"
import { QueryProvider } from "@/hooks/useQueryContext"
import React from "react"

const QueryAndModalWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <ModalProvider>{children}</ModalProvider>
    </QueryProvider>
  )
}

export default QueryAndModalWrapper
