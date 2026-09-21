"use client"

import { AlertTriangle, X } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"

import { mediaApi } from "./media.api"
import { useModalContext } from "@/hooks/useModalContext"

import { Button } from "@/components/ui/button"
import { useMedia } from "./useMedia"
import Loading from "@/components/ui/loading"

export function DeleteConfirmationModal() {
  const { action, resetAction, itemId, extraState, itemIds } = useModalContext()
  const { clear } = useMedia()

  const [deleteMedia, { isLoading }] = mediaApi.useDeleteMediaMutation()
  const [bulkDeleteMedia, { isLoading: isDeleting }] =
    mediaApi.useBulkDeleteMediaMutation()

  const handleDelete = async () => {
    try {
      if (action === "bulk-delete") {
        await bulkDeleteMedia({
          ids: itemIds,
        }).unwrap()
        toast.success(`${extraState?.name} deleted successfully`)
        resetAction()
        clear()
      }

      if (action === "delete" && itemId) {
        await deleteMedia(itemId).unwrap()
        toast.success(`${extraState?.name} deleted successfully`)
        resetAction()
        clear()
      }
    } catch {
      toast.error("Failed to delete media")
    }
  }

  return (
    <Dialog.Root
      open={action === "delete" || action === "bulk-delete"}
      onOpenChange={(open) => !open && resetAction()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background shadow-2xl">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Delete Media</h2>
                </div>
              </div>

              <button
                onClick={resetAction}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {isLoading || isDeleting ? (
              <div className="flex h-32 items-center justify-center">
                <Loading />
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <p className="text-foreground">
                  Are you sure you want to delete this media?
                </p>

                <p className="font-semibold text-destructive">
                  <span className="">{extraState?.name}</span>{" "}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={resetAction}
                size={"lg"}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                size={"lg"}
              >
                Delete
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
