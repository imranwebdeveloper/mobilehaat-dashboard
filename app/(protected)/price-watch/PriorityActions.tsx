"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Ban, Check, Pencil, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DisplayConfirmationModal } from "@/components/common/DisplayConfirmationModal"
import { usePermission } from "@/hooks/usePermission"
import { Permissions } from "@/config/permissions"
import UpdatePriceDialog from "../phones/UpdatePriceDialog"
import { useGetPhoneByIdQuery } from "../phones/phones.api"
import {
  useConfirmPriceMutation,
  useMarkDiscontinuedMutation,
  useMarkPriceNotFoundMutation,
} from "./price-watch.api"
import { PhonePriority } from "./price-watch.type"

const errorMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback

/** Loads the full phone (with variant ids) and opens the existing price dialog. */
const PriceEditor = ({
  phoneId,
  onClose,
}: {
  phoneId: string
  onClose: () => void
}) => {
  const { data, isLoading } = useGetPhoneByIdQuery(phoneId)
  const phone = data?.data

  if (isLoading || !phone) return null

  return (
    <UpdatePriceDialog
      phone={phone}
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <span className="hidden" />
    </UpdatePriceDialog>
  )
}

const ActionButton = ({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className={`size-8 ${className ?? ""}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
)

const PriorityActions = ({ row }: { row: PhonePriority }) => {
  const { hasPermission } = usePermission()
  const [editing, setEditing] = useState(false)
  const [confirmDiscontinue, setConfirmDiscontinue] = useState(false)

  const [confirmPrice, { isLoading: confirming }] = useConfirmPriceMutation()
  const [markNotFound, { isLoading: missing }] = useMarkPriceNotFoundMutation()
  const [markDiscontinued, { isLoading: discontinuing }] =
    useMarkDiscontinuedMutation()

  if (!hasPermission(Permissions.PHONE_UPDATE)) return null

  const busy = confirming || missing || discontinuing

  const handleConfirm = async () => {
    try {
      await confirmPrice(row.id).unwrap()
      toast.success(`${row.title}: price confirmed`)
    } catch (error) {
      toast.error(errorMessage(error, "Failed to confirm price"))
    }
  }

  const handleNotFound = async () => {
    try {
      const res = await markNotFound(row.id).unwrap()
      const misses = res.data?.missCount ?? row.missCount + 1
      toast.success(`${row.title}: marked not found (${misses} in a row)`)
    } catch (error) {
      toast.error(errorMessage(error, "Failed to mark as not found"))
    }
  }

  const handleDiscontinue = async () => {
    try {
      await markDiscontinued(row.id).unwrap()
      toast.success(`${row.title} marked DISCONTINUED`)
      setConfirmDiscontinue(false)
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update BD status"))
    }
  }

  return (
    <div className="flex items-center gap-1">
      <ActionButton
        label="Price is still correct"
        onClick={handleConfirm}
        disabled={busy}
        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <Check className="size-4" />
      </ActionButton>

      <ActionButton
        label="Edit price"
        onClick={() => setEditing(true)}
        disabled={busy}
      >
        <Pencil className="size-4" />
      </ActionButton>

      <ActionButton
        label="Price not found anywhere"
        onClick={handleNotFound}
        disabled={busy}
        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
      >
        <SearchX className="size-4" />
      </ActionButton>

      {row.suggestDiscontinued && (
        <ActionButton
          label={`Not found ${row.missCount}× — mark DISCONTINUED`}
          onClick={() => setConfirmDiscontinue(true)}
          disabled={busy}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Ban className="size-4" />
        </ActionButton>
      )}

      {editing && (
        <PriceEditor phoneId={row.id} onClose={() => setEditing(false)} />
      )}

      <DisplayConfirmationModal
        open={confirmDiscontinue}
        onClose={() => setConfirmDiscontinue(false)}
        onDelete={handleDiscontinue}
        isLoading={discontinuing}
        title="Mark as discontinued?"
        description={`The price was not found ${row.missCount} times in a row. Set BD status to DISCONTINUED? It will stop appearing in the price list.`}
        name={row.title}
        actionLabel="Mark discontinued"
      />
    </div>
  )
}

export default PriorityActions
