import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { paymentUpdateSchema, PaymentUpdateValues } from "./payment-record.dto"
import { paymentRecordApi } from "./payment-record.api"
import { useModalContext } from "@/hooks/useModalContext"

type ApiError = {
  data?: {
    message?: string
  }
}

export const useUpdateForm = () => {
  const { action, resetAction, itemId, extraState } = useModalContext()

  const [updatePayment, updateRes] =
    paymentRecordApi.useUpdatePaymentRecordMutation()

  const schema = useMemo(() => paymentUpdateSchema(), [])
  const form = useForm<PaymentUpdateValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (action === "edit" && extraState?.record) {
      const r = extraState.record
      form.reset({
        payment_method: r.payment_method || "",
        amount: r.amount ?? undefined,
        transaction_reference: r.transaction_reference ?? "",
      })
    }
  }, [action, extraState, form])

  const onSubmit = async (data: PaymentUpdateValues) => {
    try {
      if (!itemId) return

      const body: {
        payment_method?: string
        amount?: number
        transaction_reference?: string
      } = {}

      if (data.payment_method) body.payment_method = data.payment_method
      if (
        data.amount !== undefined &&
        data.amount !== null &&
        !Number.isNaN(data.amount)
      )
        body.amount = Number(data.amount)
      if (data.transaction_reference)
        body.transaction_reference = data.transaction_reference

      await updatePayment({ id: itemId, body }).unwrap()
      toast.success("Payment record updated")
      handleClose()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(err.data?.message || "Something went wrong")
    }
  }

  const handleClose = () => {
    form.reset()
    resetAction()
  }

  return {
    form,
    onSubmit,
    isLoading: updateRes.isLoading,
    handleClose,
    open: action === "edit",
  }
}
