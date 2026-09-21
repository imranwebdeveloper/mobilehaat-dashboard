"use client"

import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"
import { toast } from "sonner"
import { useModalContext } from "@/hooks/useModalContext"
import {
  useUpdateSellerOfferStatusMutation,
  useDeleteSellerOfferMutation,
} from "./seller-offer.api"
import { SellerOfferStatus } from "./seller-offer.type"

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
  activate: {
    title: "Activate offer?",
    description:
      "This offer will become visible to buyers immediately. The seller must have an active subscription with available offer slots.",
    actionLabel: "Activate",
    destructive: false,
  },
  pause: {
    title: "Pause offer?",
    description:
      "This offer will be hidden from buyers. The seller can reactivate it later.",
    actionLabel: "Pause",
    destructive: false,
  },
  delete: {
    title: "Delete offer?",
    description:
      "This will permanently remove the offer. This action cannot be undone.",
    actionLabel: "Delete",
    destructive: true,
  },
}

const Modal = () => {
  const [updateStatus, { isLoading }] =
    useUpdateSellerOfferStatusMutation()
  const [deleteOffer, { isLoading: isDeleting }] =
    useDeleteSellerOfferMutation()

  const { action, resetAction, itemId, extraState } = useModalContext()

  const isConfirmationAction =
    action === "activate" ||
    action === "pause" ||
    action === "delete"

  const handleConfirm = async () => {
    try {
      if (!itemId) return

      if (action === "delete") {
        await deleteOffer(itemId).unwrap()
      } else {
        const statusMap: Record<string, string> = {
          activate: SellerOfferStatus.ACTIVE,
          pause: SellerOfferStatus.PAUSED,
        }

        await updateStatus({
          id: itemId,
          status: statusMap[action!],
        }).unwrap()
      }

      const successMsg: Record<string, string> = {
        activate: "Offer activated",
        pause: "Offer paused",
        delete: "Offer deleted",
      }
      toast.success(successMsg[action!])

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
    <DisplayConfirmationModal
      onDelete={handleConfirm}
      isLoading={isLoading || isDeleting}
      name={extraState.name || ""}
      onClose={handleClose}
      open={isConfirmationAction}
      title={config?.title || "Action"}
      description={config?.description}
      actionLabel={config?.actionLabel}
      destructive={config?.destructive ?? true}
    />
  )
}

export default Modal
