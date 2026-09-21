import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  phoneCategorySchema,
  PhoneCategoryFormValues,
} from "./phone-category.dto"
import { phoneCategoryApi } from "./phone-category.api"
import { IMedia } from "../media/media.type"
import { PhoneCategoryStatus } from "./phone-category.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: PhoneCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  icon_name: "",
  thumbnail: null,
  status: PhoneCategoryStatus.ACTIVE,
  order: 0,
  is_featured: false,
}

type ApiError = {
  data?: {
    message?: string
    error?: string
  }
}

export const useCustomForm = () => {
  const [thumbnail, setThumbnail] = useState<IMedia | null>(null)
  const { action, itemId, resetAction } = useModalContext()
  const isEdit = action === "edit"

  const [create, createRes] = phoneCategoryApi.useCreatePhoneCategoryMutation()
  const [update, updateRes] = phoneCategoryApi.useUpdatePhoneCategoryMutation()
  const [getById, getByIdRes] =
    phoneCategoryApi.useLazyGetPhoneCategoryByIdQuery()

  const schema = useMemo(() => phoneCategorySchema(), [])

  const form = useForm<PhoneCategoryFormValues>({
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
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || "",
            icon_name: data.icon_name || "",
            status: data.status,
            order: data.order || 0,
            is_featured: data.is_featured || false,
          })

          setThumbnail(
            data.thumbnail && typeof data.thumbnail !== "string"
              ? data.thumbnail
              : null
          )
        })
    }
  }, [isEdit, itemId, getById, form])

  const onSubmit = async (data: PhoneCategoryFormValues) => {
    try {
      const payload = {
        ...data,
        slug: data.slug?.trim() || undefined,
        order: Number(data.order),
        thumbnail: thumbnail?._id || null,
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Phone category updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Phone category created successfully")
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
    setThumbnail(null)
    resetAction()
  }

  return {
    form,
    thumbnail,
    setThumbnail,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleClose,
    open: action === "create" || action === "edit",
  }
}
