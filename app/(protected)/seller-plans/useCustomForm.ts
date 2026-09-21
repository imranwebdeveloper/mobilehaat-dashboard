import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { sellerPlanSchema, SellerPlanFormValues } from "./seller-plan.dto"
import { sellerPlanApi } from "./seller-plan.api"
import { SellerPlanStatus, SellerPlanCurrency } from "./seller-plan.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: SellerPlanFormValues = {
  name: "",
  slug: "",
  description: "",
  features: [],
  monthly_price: 0,
  is_paid: false,
  currency: SellerPlanCurrency.BDT,
  max_active_offers: 0,
  featured_listing: false,
  priority_listing: false,
  analytics: false,
  verified_badge: false,
  sort_order: 0,
  is_default: false,
  status: SellerPlanStatus.ACTIVE,
}

type ApiError = {
  data?: {
    message?: string
    error?: string
  }
}

export const useCustomForm = () => {
  const { action, itemId, resetAction } = useModalContext()
  const isEdit = action === "edit"

  const [create, createRes] = sellerPlanApi.useCreateSellerPlanMutation()
  const [update, updateRes] = sellerPlanApi.useUpdateSellerPlanMutation()
  const [getById, getByIdRes] = sellerPlanApi.useLazyGetSellerPlanByIdQuery()

  const schema = useMemo(() => sellerPlanSchema(), [])

  const form = useForm<SellerPlanFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
        .unwrap()
        .then((response) => {
          const data = response.data

          form.reset({
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            features: data.features || [],
            monthly_price: data.monthly_price,
            is_paid: data.is_paid || false,
            currency: data.currency,
            max_active_offers: data.max_active_offers,
            featured_listing: data.featured_listing || false,
            priority_listing: data.priority_listing || false,
            analytics: data.analytics || false,
            verified_badge: data.verified_badge || false,
            sort_order: data.sort_order || 0,
            is_default: data.is_default || false,
            status: data.status,
          })
        })
    }
  }, [isEdit, itemId, getById, form])

  const onSubmit = async (data: SellerPlanFormValues) => {
    try {
      const payload = {
        ...data,
        slug: data.slug?.trim() || undefined,
        features: (data.features || [])
          .map((feature) => feature.trim())
          .filter(Boolean),
        monthly_price: Number(data.monthly_price),
        max_active_offers: Number(data.max_active_offers),
        sort_order: Number(data.sort_order),
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Seller plan updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Seller plan created successfully")
      }

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
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleClose,
    open: action === "create" || action === "edit",
  }
}
