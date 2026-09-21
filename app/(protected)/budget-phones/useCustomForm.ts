/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { budgetPhoneSchema, BudgetPhoneFormValues } from "./budget-phones.dto"
import { budgetPhoneApi } from "./budget-phones.api"
import { BudgetPhoneStatus } from "./budget-phones.type"
import { IMedia } from "../media/media.type"
import { slugify } from "@/lib/utils"

const defaultValues: BudgetPhoneFormValues = {
  title: "",
  slug: "",
  description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  thumbnail: null,
  min_price: 0,
  max_price: 0,
  status: BudgetPhoneStatus.ACTIVE,
  rankings: [],
  faq: [],
}

type ApiError = {
  data?: {
    message?: string
    error?: string
  }
}

export const useCustomForm = () => {
  const router = useRouter()
  const params = useParams()
  const [thumbnail, setThumbnail] = useState<IMedia | null>(null)

  const itemId = params?.id as string
  const isEdit = !!itemId

  const [create, createRes] = budgetPhoneApi.useCreateBudgetPhoneMutation()
  const [update, updateRes] = budgetPhoneApi.useUpdateBudgetPhoneMutation()
  const [getById, getByIdRes] = budgetPhoneApi.useLazyGetBudgetPhoneByIdQuery()

  const schema = useMemo(() => budgetPhoneSchema(), [])

  const form = useForm<BudgetPhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const titleValue = form.watch("title")

  // Auto-generate slug when title changes if slug is empty and not in edit mode
  useEffect(() => {
    const currentSlug = form.getValues("slug")
    if (titleValue && !currentSlug && !isEdit) {
      form.setValue("slug", slugify(titleValue), { shouldValidate: true })
    }
  }, [titleValue, form, isEdit])

  const handleGenerateSlug = () => {
    const slug = slugify(form.getValues("title") || "")
    form.setValue("slug", slug, { shouldValidate: true })
  }

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
    }
  }, [isEdit, itemId, getById])

  useEffect(() => {
    if (getByIdRes.data && isEdit) {
      const data = getByIdRes.data.data
      const rankings = data.rankings?.map((r) => ({
        rank: r.rank,
        phone_id: r.phone?._id || "",
        verdict: r.verdict,
        label: r.phone?.title,
      }))
      form.reset({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        meta_keywords: data.meta_keywords || "",
        thumbnail: (data.thumbnail as any)?._id || data.thumbnail || null,
        min_price: data.min_price,
        max_price: data.max_price,
        status: data.status,
        rankings: rankings || [],
        faq: data.faq || [],
      })

      if (data.thumbnail) {
        setThumbnail(data.thumbnail as any)
      }
    }
  }, [form, isEdit, getByIdRes.data])

  const onSubmit = async (data: BudgetPhoneFormValues) => {
    try {
      const payload = {
        ...data,
        thumbnail: thumbnail?._id || data.thumbnail,
        min_price: Number(data.min_price),
        max_price: Number(data.max_price),
        rankings: data.rankings?.map((r) => ({
          rank: r.rank,
          phone_id: r.phone_id,
          verdict: r.verdict,
        })),
        faq: data.faq || [],
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Budget phone updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Budget phone created successfully")
      }

      handleBack()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(
        err.data?.message || err.data?.error || "Something went wrong"
      )
    }
  }

  const handleBack = () => {
    router.push("/budget-phones")
  }

  return {
    form,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleBack,
    handleGenerateSlug,
    thumbnail,
    setThumbnail,
  }
}
