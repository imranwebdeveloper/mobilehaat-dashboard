"use client"

import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { paymentRecordApi } from "./payment-record.api"
import RejectForm from "./RejectForm"
import UpdateForm from "./UpdateForm"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"

type ApiError = {
  data?: {
    message?: string
  }
}

const confirmationConfig: Record<
  string,
  { title: string; description: string; actionLabel: string }
> = {
  verify: {
    title: "Verify payment",
    description:
      "This will mark the payment as verified and activate the linked subscription.",
    actionLabel: "Verify",
  },
}

const Modal = () => {
  const [verifyData, verifyRes] =
    paymentRecordApi.useVerifyPaymentRecordMutation()

  const { action, resetAction, itemId, extraState } = useModalContext()

  const isConfirmationAction = action === "verify"

  const handleConfirm = async () => {
    try {
      if (!itemId) return

      if (action === "verify") {
        await verifyData(itemId).unwrap()
        toast.success("Payment verified and subscription activated")
      }

      resetAction()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(err.data?.message || "Action failed")
    }
  }

  const handleClose = () => {
    resetAction()
  }

  const config = confirmationConfig[action || ""]

  return (
    <div>
      <DisplayConfirmationModal
        onDelete={handleConfirm}
        isLoading={verifyRes.isLoading}
        name={extraState.name || ""}
        onClose={handleClose}
        open={isConfirmationAction}
        title={config?.title || "Action"}
        description={config?.description}
        actionLabel={config?.actionLabel}
        destructive={false}
      />
      <RejectForm />
      <UpdateForm />
    </div>
  )
}

export default Modal
