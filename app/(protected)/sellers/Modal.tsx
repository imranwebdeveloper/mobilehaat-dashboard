"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"

import { useModalContext } from "@/hooks/useModalContext"
import { AttachmentPreviews } from "@/hooks/useMediaByIds"
import { sellerApi } from "./seller.api"

import { SellerStatus, SellerVerificationStatus } from "./seller.type"
import {
  SELLER_STATUS_OPTIONS,
  SELLER_VERIFICATION_OPTIONS,
} from "./seller.constant"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Loading from "@/components/ui/loading"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ApiError = {
  data?: {
    message?: string
  }
}

interface ChangeDialogProps {
  open: boolean
  name: string
  itemId?: string
  onClose: () => void
}

/* ------------------------- Status Dialog ------------------------- */

const StatusContent = ({
  itemId,
  currentStatus,
  onClose,
}: {
  itemId: string
  currentStatus?: SellerStatus
  onClose: () => void
}) => {
  const [status, setStatus] = useState<SellerStatus>(
    currentStatus || SellerStatus.ACTIVE
  )
  const [updateStatus, updateStatusRes] =
    sellerApi.useUpdateSellerStatusMutation()

  const handleSubmit = async () => {
    try {
      await updateStatus({ id: itemId, body: { status } }).unwrap()
      toast.success("Seller status updated successfully")
      onClose()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(err.data?.message || "Status update failed")
    }
  }

  return (
    <>
      {updateStatusRes.isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loading />
        </div>
      ) : (
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as SellerStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {SELLER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <DialogFooter className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          size="lg"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={updateStatusRes.isLoading}
          size="lg"
        >
          {updateStatusRes.isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </>
  )
}

const StatusDialog = ({
  open,
  name,
  itemId,
  currentStatus,
  onClose,
}: ChangeDialogProps & { currentStatus?: SellerStatus }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="rounded-2xl sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change Seller Status</DialogTitle>
        <DialogDescription>
          Update the account status for{" "}
          <span className="font-semibold text-foreground">{name}</span>.
        </DialogDescription>
      </DialogHeader>

      {open && itemId ? (
        <StatusContent
          itemId={itemId}
          currentStatus={currentStatus}
          onClose={onClose}
        />
      ) : null}
    </DialogContent>
  </Dialog>
)

/* ---------------------- Verification Dialog ---------------------- */

const VerificationContent = ({
  itemId,
  currentStatus,
  reason: initialReason,
  attachments,
  onClose,
}: {
  itemId: string
  currentStatus?: SellerVerificationStatus
  reason?: string
  attachments?: string[]
  onClose: () => void
}) => {
  const [status, setStatus] = useState<SellerVerificationStatus>(
    currentStatus || SellerVerificationStatus.UNVERIFIED
  )
  const [reason, setReason] = useState(initialReason || "")
  const [updateVerification, updateVerificationRes] =
    sellerApi.useUpdateSellerVerificationMutation()

  const handleSubmit = async (overrideStatus?: SellerVerificationStatus) => {
    const finalStatus = overrideStatus || status
    try {
      await updateVerification({
        id: itemId,
        body: {
          status: finalStatus,
          ...(finalStatus === SellerVerificationStatus.REJECTED
            ? { reason }
            : {}),
        },
      }).unwrap()
      toast.success("Seller verification updated successfully")
      onClose()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(err.data?.message || "Verification update failed")
    }
  }

  return (
    <>
      {updateVerificationRes.isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
              onClick={() => handleSubmit(SellerVerificationStatus.VERIFIED)}
              disabled={updateVerificationRes.isLoading}
            >
              <CheckCircleIcon className="mr-2 h-4 w-4" /> Verify
            </Button>
            <Button
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
              onClick={() => handleSubmit(SellerVerificationStatus.REJECTED)}
              disabled={updateVerificationRes.isLoading}
            >
              <XCircleIcon className="mr-2 h-4 w-4" /> Reject
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or choose status
              </span>
            </div>
          </div>

          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as SellerVerificationStatus)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select verification status" />
            </SelectTrigger>
            <SelectContent>
              {SELLER_VERIFICATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rejection reason — show for REJECTED status or if there's an existing reason */}
          {status === SellerVerificationStatus.REJECTED && (
            <div className="space-y-2">
              <label
                htmlFor="rejection-reason"
                className="text-sm font-medium text-foreground"
              >
                Rejection reason
              </label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why this application was rejected..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          )}

          {/* Attachment previews */}
          <AttachmentPreviews ids={attachments} />
        </div>
      )}

      <DialogFooter className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          size="lg"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleSubmit()}
          disabled={updateVerificationRes.isLoading}
          size="lg"
        >
          {updateVerificationRes.isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </>
  )
}

const VerificationDialog = ({
  open,
  name,
  itemId,
  currentStatus,
  reason,
  attachments,
  onClose,
}: ChangeDialogProps & {
  currentStatus?: SellerVerificationStatus
  reason?: string
  attachments?: string[]
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="rounded-2xl sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Manage Verification</DialogTitle>
        <DialogDescription>
          Update the verification status for{" "}
          <span className="font-semibold text-foreground">{name}</span>.
        </DialogDescription>
      </DialogHeader>

      {open && itemId ? (
        <VerificationContent
          itemId={itemId}
          currentStatus={currentStatus}
          reason={reason}
          attachments={attachments}
          onClose={onClose}
        />
      ) : null}
    </DialogContent>
  </Dialog>
)

/* ------------------------- Modal ------------------------- */

const Modal = () => {
  const { action, itemId, extraState, resetAction } = useModalContext()

  return (
    <div>
      <StatusDialog
        open={action === "status"}
        name={extraState.name || ""}
        itemId={itemId || undefined}
        currentStatus={extraState.currentStatus}
        onClose={resetAction}
      />
      <VerificationDialog
        open={action === "verify"}
        name={extraState.name || ""}
        itemId={itemId || undefined}
        currentStatus={extraState.currentStatus}
        reason={extraState.reason}
        attachments={extraState.attachments}
        onClose={resetAction}
      />
    </div>
  )
}

export default Modal
