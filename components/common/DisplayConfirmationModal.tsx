"use client"

import { AlertTriangle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import Loading from "@/components/ui/loading"

interface DeleteConfirmationModalProps {
  onDelete: () => void
  onClose: () => void
  isLoading?: boolean
  title?: string
  description?: string
  open?: boolean
  name: string
  actionLabel?: string
  destructive?: boolean
}

export function DisplayConfirmationModal({
  onDelete,
  isLoading = false,
  title = "Delete",
  description = "Are you sure you want to delete this item?",
  name,
  open = false,
  onClose,
  actionLabel,
  destructive = true,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Header */}

      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full ${destructive ? "bg-destructive/10" : "bg-amber-500/10"} p-2`}>
              <AlertTriangle className={`h-5 w-5 ${destructive ? "text-destructive" : "text-amber-600"}`} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p>{description}</p>
            <p className="font-semibold text-destructive">{name}</p>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            size="lg"
          >
            Cancel
          </Button>

          <Button
            variant={destructive ? "destructive" : "default"}
            className="flex-1"
            onClick={onDelete}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Processing..." : actionLabel || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DisplayConfirmationModal
