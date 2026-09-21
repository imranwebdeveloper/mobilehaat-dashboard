"use client"

import { useModalContext } from "@/hooks/useModalContext"
import DisplayConfirmationModal from "@/components/common/DisplayConfirmationModal"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Form from "./Form"
import { contactApi } from "./contacts.api"
import { toast } from "sonner"

const Modal = () => {
  const { action, resetAction, itemId, extraState } = useModalContext()
  const [deleteContact, { isLoading: isDeleting }] =
    contactApi.useDeleteContactMutation()

  const handleDelete = async () => {
    if (!itemId) return
    try {
      await deleteContact(itemId).unwrap()
      toast.success("Contact deleted successfully")
      resetAction()
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || "Failed to delete contact")
    }
  }

  return (
    <>
      <Dialog
        open={action === "create" || action === "edit"}
        onOpenChange={(open) => !open && resetAction()}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {action === "create" ? "Add Contact" : "Contact Details"}
            </DialogTitle>
          </DialogHeader>
          <Form />
        </DialogContent>
      </Dialog>

      <DisplayConfirmationModal
        onDelete={handleDelete}
        isLoading={isDeleting}
        name={extraState.name || ""}
        onClose={resetAction}
        open={action === "delete" || action === "bulk-delete"}
        title={`Delete Contact${action === "bulk-delete" ? "s" : ""}`}
      />
    </>
  )
}

export default Modal
