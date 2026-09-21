import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { paymentRejectSchema, PaymentRejectValues } from "./payment-record.dto"
import { paymentRecordApi } from "./payment-record.api"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: PaymentRejectValues = {
  rejection_reason: "",
}

type ApiError = {
  data?: {
    message?: string
  }
}

export const useRejectForm = () => {
  const { action, resetAction, itemId } = useModalContext()

  const [rejectPayment, rejectRes] =
    paymentRecordApi.useRejectPaymentRecordMutation()

  const schema = useMemo(() => paymentRejectSchema(), [])
  const form = useForm<PaymentRejectValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = async (data: PaymentRejectValues) => {
    try {
      if (!itemId) return
      await rejectPayment({
        id: itemId,
        body: { rejection_reason: data.rejection_reason.trim() },
      }).unwrap()
      toast.success("Payment rejected")
      handleClose()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(err.data?.message || "Something went wrong")
    }
  }

  const handleClose = () => {
    form.reset(defaultValues)
    resetAction()
  }

  return {
    form,
    onSubmit,
    isLoading: rejectRes.isLoading,
    handleClose,
    open: action === "reject",
  }
}
