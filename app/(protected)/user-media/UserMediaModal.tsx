"use client"

import { useModalContext } from "@/hooks/useModalContext"
import { useDeleteUserMediaMutation, useBulkDeleteUserMediaMutation } from "./user-media.api"
import { DisplayConfirmationModal } from "@/components/common/DisplayConfirmationModal"

export default function UserMediaModal() {
  const { action, itemId, itemIds, resetAction } = useModalContext()
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteUserMediaMutation()
  const [bulkDelete, { isLoading: isBulkDeleting }] = useBulkDeleteUserMediaMutation()

  const handleDelete = async () => {
    if (!itemId) return
    await deleteMedia(itemId)
    resetAction()
  }

  const handleBulkDelete = async () => {
    if (!itemIds?.length) return
    await bulkDelete({ ids: itemIds })
    resetAction()
  }

  return (
    <>
      <DisplayConfirmationModal
        onDelete={handleDelete}
        onClose={resetAction}
        open={action === "delete"}
        title="Delete media"
        description="This action cannot be undone. The file will be permanently removed."
        name=""
        isLoading={isDeleting}
        destructive
      />

      <DisplayConfirmationModal
        onDelete={handleBulkDelete}
        onClose={resetAction}
        open={action === "bulk-delete"}
        title={`Delete ${itemIds?.length || 0} items`}
        description="This action cannot be undone. All selected files will be permanently removed."
        name=""
        isLoading={isBulkDeleting}
        destructive
      />
    </>
  )
}
