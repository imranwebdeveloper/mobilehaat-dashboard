/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react"

/* -----------------------------
 Types
----------------------------- */

export type ModalAction =
  | "create"
  | "view"
  | "edit"
  | "delete"
  | "bulk-delete"
  | "muted"
  | "letter"
  | "status"
  | "verify"
  | "cancel"
  | "cancel-immediate"
  | "suspend"
  | "activate"
  | "expire"
  | "reject"
  | "pause"
  | null

export interface ModalState {
  action: ModalAction
  itemId: string | null
  itemIds: string[]
  extraState: any
}

export type ModalPayload = Partial<ModalState>

interface ModalContextType extends ModalState {
  setAction: (payload?: ModalPayload) => void
  resetAction: () => void
  updateExtraState: (state: Record<string, unknown>) => void
}

/* -----------------------------
 Initial State
----------------------------- */

const initialState: ModalState = {
  action: null,
  itemId: null,
  itemIds: [],
  extraState: {},
}

/* -----------------------------
 Context
----------------------------- */

const ModalContext = createContext<ModalContextType | null>(null)

/* -----------------------------
 Provider
----------------------------- */

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(initialState)

  const setAction = useCallback((payload?: ModalPayload) => {
    if (!payload) {
      setState(initialState)
      return
    }

    setState((prev) => ({
      ...prev,
      ...payload,
    }))
  }, [])

  const resetAction = useCallback(() => {
    setState(initialState)
  }, [])

  const updateExtraState = useCallback((newState: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      extraState: {
        ...prev.extraState,
        ...newState,
      },
    }))
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      setAction,
      resetAction,
      updateExtraState,
    }),
    [state, setAction, resetAction, updateExtraState]
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

/* -----------------------------
 Hook
----------------------------- */

export function useModalContext(defaults?: ModalPayload) {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error("useModalContext must be used within ModalProvider")
  }

  const setAction = (payload?: ModalPayload) => {
    context.setAction({
      ...defaults,
      ...payload,
    })
  }

  return {
    ...context,
    setAction,
  }
}
