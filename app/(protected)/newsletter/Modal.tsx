/* eslint-disable @typescript-eslint/no-explicit-any */
import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { newsletterApi } from "./newsletter.api"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"

const Modal = () => {
  const [deleteData, deleteRes] = newsletterApi.useDeleteNewsletterMutation()
  const [bulkDeleteData, bulkDeleteRes] =
    newsletterApi.useBulkDeleteNewsletterMutation()
  const { action, resetAction, itemId, itemIds, extraState, setAction } =
    useModalContext()

  const isBulk = action === "bulk-delete"

  const handleDelete = async () => {
    try {
      const payload = isBulk ? itemIds : itemId
      if (!payload) return
      if (action === "delete" && itemId) {
        await deleteData(itemId).unwrap()
      }
      if (action === "bulk-delete" && itemIds) {
        await bulkDeleteData({ ids: itemIds }).unwrap()
      }
      toast.success(
        isBulk
          ? "Selected items deleted successfully"
          : "Subscriber deleted successfully"
      )
      resetAction()
    } catch (error: any) {
      resetAction()
      toast.error(error?.data?.message || "Delete failed")
    }
  }

  const handleClose = () => {
    if (isBulk) {
      setAction({
        action: "letter",
        itemIds,
        extraState,
      })
    } else {
      resetAction()
    }
  }

  return (
    <div>
      <DisplayConfirmationModal
        onDelete={handleDelete}
        isLoading={deleteRes.isLoading || bulkDeleteRes.isLoading}
        name={extraState.email || ""}
        onClose={handleClose}
        open={action === "delete" || action === "bulk-delete"}
        title={isBulk ? "Delete selected items" : "Delete subscriber"}
      />
    </div>
  )
}

export default Modal
