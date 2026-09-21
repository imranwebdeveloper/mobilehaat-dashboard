"use client"

import { CommonQuery } from "@/store/global.type"
import { createContext, useContext, useState, ReactNode, useMemo } from "react"

interface QueryContextType {
  query: CommonQuery
  setQuery: (
    newQuery: Partial<CommonQuery>,
    options?: { reset: boolean }
  ) => void
  resetQuery: () => void
}

// Default query values
const defaultQuery: CommonQuery = {
  limit: 12,
  page: 1,
  sortBy: "desc",
}

// Create context
const QueryContext = createContext<QueryContextType | undefined>(undefined)

// Provider component
export function QueryProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState<CommonQuery>({ ...defaultQuery })

  const setQuery = (
    newQuery: Partial<CommonQuery>,
    options?: { reset: boolean }
  ) => {
    if (options?.reset) {
      setQueryState({ ...newQuery })
    } else {
      setQueryState((prev) => ({ ...prev, ...newQuery }))
    }
  }

  const resetQuery = () => setQueryState({ ...defaultQuery })

  const value = useMemo(() => ({ query, setQuery, resetQuery }), [query])

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
}

// Custom hook
export function useQueryContext(): QueryContextType {
  const context = useContext(QueryContext)
  if (!context) {
    throw new Error("useQueryContext must be used within a QueryProvider")
  }
  return context
}
