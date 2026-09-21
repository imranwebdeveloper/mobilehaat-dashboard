"use client"

import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { sellerSubscriptionApi } from "./seller-subscription.api"
import Form from "./Form"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"
import { SubscriptionStatus } from "./seller-subscription.type"

type ApiError = {
  data?: {
    message?: string
  }
}

const confirmationConfig: Record<
  string,
  {
    title: string
    description: string
    actionLabel: string
    destructive?: boolean
  }
> = {
  cancel: {
    title: "Cancel at period end?",
    description:
      "The subscription will remain active until the current period ends, then cancel automatically.",
    actionLabel: "Cancel at Period End",
    destructive: false,
  },
  "cancel-immediate": {
    title: "Cancel subscription immediately?",
    description:
      "This will revoke access right away and restore a FREE plan.",
    actionLabel: "Cancel Now",
    destructive: true,
  },
  suspend: {
    title: "Suspend subscription?",
    description:
      "The seller will lose access to paid features until reactivated.",
    actionLabel: "Suspend",
    destructive: true,
  },
  activate: {
    title: "Reactivate subscription?",
    description:
      "The subscription will return to ACTIVE status immediately.",
    actionLabel: "Reactivate",
    destructive: false,
  },
  expire: {
    title: "Expire subscription?",
    description:
      "This will mark the subscription as EXPIRED and restore a FREE plan.",
    actionLabel: "Expire",
    destructive: true,
  },
  delete: {
    title: "Delete subscription?",
    description:
      "This will permanently remove the subscription record. This action cannot be undone.",
    actionLabel: "Delete",
    destructive: true,
  },
}

const Modal = () => {
  const [cancelData, cancelRes] =
    sellerSubscriptionApi.useCancelSellerSubscriptionMutation()
  const [updateStatus, updateRes] =
    sellerSubscriptionApi.useUpdateSellerSubscriptionStatusMutation()
  const [deleteData, deleteRes] =
    sellerSubscriptionApi.useDeleteSellerSubscriptionMutation()

  const { action, resetAction, itemId, extraState } = useModalContext()

  const isConfirmationAction =
    action === "cancel" ||
    action === "cancel-immediate" ||
    action === "suspend" ||
    action === "activate" ||
    action === "expire" ||
    action === "delete"

  const handleConfirm = async () => {
    try {
      if (!itemId) return

      if (action === "cancel") {
        await cancelData({
          id: itemId,
          body: { immediate: false },
        }).unwrap()
        toast.success("Subscription will cancel at period end")
      } else if (action === "cancel-immediate") {
        await cancelData({
          id: itemId,
          body: { immediate: true },
        }).unwrap()
        toast.success("Subscription cancelled immediately")
      } else if (action === "suspend") {
        await updateStatus({
          id: itemId,
          body: { status: SubscriptionStatus.SUSPENDED },
        }).unwrap()
        toast.success("Subscription suspended")
      } else if (action === "activate") {
        await updateStatus({
          id: itemId,
          body: { status: SubscriptionStatus.ACTIVE },
        }).unwrap()
        toast.success("Subscription reactivated")
      } else if (action === "expire") {
        await updateStatus({
          id: itemId,
          body: { status: SubscriptionStatus.EXPIRED },
        }).unwrap()
        toast.success("Subscription expired")
      } else if (action === "delete") {
        await deleteData(itemId).unwrap()
        toast.success("Subscription deleted")
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
        isLoading={cancelRes.isLoading || updateRes.isLoading || deleteRes.isLoading}
        name={extraState.name || ""}
        onClose={handleClose}
        open={isConfirmationAction}
        title={config?.title || "Action"}
        description={config?.description}
        actionLabel={config?.actionLabel}
        destructive={config?.destructive ?? true}
      />
      <Form />
    </div>
  )
}

export default Modal
