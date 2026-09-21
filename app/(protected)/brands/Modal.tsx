import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { brandApi } from "./brands.api"
import Form from "./Form"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"

type ApiError = {
  data?: {
    message?: string
  }
}

const Modal = () => {
  const [deleteData, deleteRes] = brandApi.useDeleteBrandMutation()
  const { action, resetAction, itemId, extraState } = useModalContext()

  const handleDelete = async () => {
    try {
      if (action === "delete" && itemId) {
        await deleteData(itemId).unwrap()
        toast.success("Brand deleted successfully")
      }
      resetAction()
    } catch (error: unknown) {
      const err = error as ApiError
      resetAction()
      toast.error(err.data?.message || "Delete failed")
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
        title="Delete brand"
      />
      <Form />
    </div>
  )
}

export default Modal
