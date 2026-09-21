import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  postCategorySchema,
  PostCategoryFormValues,
} from "./post-categories.dto"
import { postCategoryApi } from "./post-categories.api"
import { IMedia } from "../media/media.type"
import { PostCategoryStatus } from "./post-categories.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: PostCategoryFormValues = {
  name: "",
  description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  thumbnail: "",
  order: 0,
  is_featured: false,
  status: PostCategoryStatus.ACTIVE,
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

  const [create, createRes] = postCategoryApi.useCreatePostCategoryMutation()
  const [update, updateRes] = postCategoryApi.useUpdatePostCategoryMutation()
  const [getById, getByIdRes] =
    postCategoryApi.useLazyGetPostCategoryByIdQuery()

  const schema = useMemo(() => postCategorySchema(isEdit), [isEdit])

  const form = useForm<PostCategoryFormValues>({
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
            description: data.description || "",
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || "",
            order: data.order || 0,
            is_featured: data.is_featured || false,
            status: data.status,
          })

          setThumbnail(
            data.thumbnail && typeof data.thumbnail !== "string"
              ? data.thumbnail
              : null
          )
        })
    }
  }, [isEdit, itemId, getById, form])

  const onSubmit = async (data: PostCategoryFormValues) => {
    try {
      const payload = {
        ...data,
        thumbnail: thumbnail?._id || null,
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Category updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Category created successfully")
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
