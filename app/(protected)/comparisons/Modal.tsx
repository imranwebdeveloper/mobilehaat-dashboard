import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { comparisonsApi } from "./comparisons.api"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"

type ApiError = {
  data?: {
    message?: string
  }
}

const Modal = () => {
  const [deleteData, deleteRes] = comparisonsApi.useDeleteComparisonMutation()
  const { action, resetAction, itemId, extraState } = useModalContext()

  const handleDelete = async () => {
    try {
      if (action === "delete" && itemId) {
        await deleteData(itemId).unwrap()
        toast.success("Comparison deleted successfully")
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
        name={extraState.title || ""}
        onClose={handleClose}
        open={action === "delete"}
        title="Delete comparison"
      />
    </div>
  )
}

export default Modal
