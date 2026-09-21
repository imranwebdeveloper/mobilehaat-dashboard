"use client"

import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { useDeletePostMutation } from "./posts.api"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"

const Modal = () => {
  const [deleteData, deleteRes] = useDeletePostMutation()
  const { action, resetAction, itemId, extraState } = useModalContext()

  const handleDelete = async () => {
    try {
      if (action === "delete" && itemId) {
        await deleteData(itemId).unwrap()
        toast.success("Post deleted successfully")
      }
      resetAction()
    } catch (error: unknown) {
      resetAction()
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || "Delete failed")
    }
  }

  const handleClose = () => {
    resetAction()
  }

  return (
    <div>
      <DisplayConfirmationModal
        onDelete={handleDelete}
        isLoading={deleteRes.isLoading}
        name={extraState.name || ""}
        onClose={handleClose}
        open={action === "delete"}
        title="Delete post"
      />
    </div>
  )
}

export default Modal
