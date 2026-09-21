import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  subscriptionAssignSchema,
  SubscriptionAssignValues,
} from "./seller-subscription.dto"
import { sellerSubscriptionApi } from "./seller-subscription.api"
import { SubscriptionPeriod } from "./seller-subscription.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: SubscriptionAssignValues = {
  seller_id: "",
  plan_id: "",
  period: SubscriptionPeriod.MONTHLY,
  duration_months: 1,
}

type ApiError = {
  data?: {
    message?: string
    error?: string
  }
}

export const useCustomForm = () => {
  const { action, resetAction } = useModalContext()

  const [addSubscription, addSubscriptionRes] =
    sellerSubscriptionApi.useAddSubscriptionMutation()

  const schema = useMemo(() => subscriptionAssignSchema(), [])

  const form = useForm<SubscriptionAssignValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const watchPeriod = form.watch("period")
  const watchDuration = form.watch("duration_months")

  const periodMonths: Record<string, number> = {
    MONTHLY: 1,
    QUARTERLY: 3,
    HALF_YEARLY: 6,
    YEARLY: 12,
    CUSTOM: Number(watchDuration) || 1,
  }

  useEffect(() => {
    if (watchPeriod && watchPeriod !== SubscriptionPeriod.CUSTOM) {
      form.setValue("duration_months", periodMonths[watchPeriod])
    }
  }, [watchPeriod, form])

  const onSubmit = async (data: SubscriptionAssignValues) => {
    try {
      await addSubscription({
        seller_id: data.seller_id,
        plan_id: data.plan_id,
        period: data.period,
        duration_months: Number(data.duration_months),
      }).unwrap()
      toast.success("Subscription added successfully")
      handleClose()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(
        err.data?.message || err.data?.error || "Something went wrong"
      )
    }
  }

  const handleClose = () => {
    form.reset(defaultValues)
    resetAction()
  }

  return {
    form,
    onSubmit,
    isLoading: addSubscriptionRes.isLoading,
    isFetching: addSubscriptionRes.isLoading,
    handleClose,
    open: action === "create",
  }
}
