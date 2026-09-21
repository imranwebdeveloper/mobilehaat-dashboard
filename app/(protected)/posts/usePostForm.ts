"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { postSchema, PostFormValues } from "./posts.dto"
import {
  useCreatePostMutation,
  useUpdatePostMutation,
  postApi,
} from "./posts.api"
import { IMedia } from "../media/media.type"
import { PostStatus, PostType } from "./posts.type"
import { SelectOption } from "@/components/common/select/AsyncSelect"
import { slugify } from "@/lib/utils"
import { toDateTimeLocal } from "@/lib/date"

const defaultValues: PostFormValues = {
  title: "",
  content: "",
  excerpt: "",
  thumbnail: "",
  category: "",
  author: "",
  status: PostStatus.DRAFT,
  type: PostType.POST,
  tags: [],
  meta_title: "",
  meta_description: "",
  slug: "",
  published_at: "",
}

export const usePostForm = () => {
  const [thumbnail, setThumbnail] = useState<IMedia | undefined>()
  const [category, setCategory] = useState<SelectOption | null>(null)
  const [author, setAuthor] = useState<SelectOption | null>(null)
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const isEdit = !!itemId

  const [create, createRes] = useCreatePostMutation()
  const [update, updateRes] = useUpdatePostMutation()
  const [getById, getByIdRes] = postApi.useLazyGetPostByIdQuery()

  const schema = useMemo(() => postSchema(isEdit), [isEdit])

  const form = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const titleValue = form.watch("title")
  const statusValue = form.watch("status")

  const handleGenerateSlug = () => {
    const slug = slugify(form.getValues("title"))
    form.setValue("slug", slug, { shouldValidate: true })
  }

  // Auto-generate slug when title changes if slug is empty and not in edit mode
  useEffect(() => {
    const currentSlug = form.getValues("slug")
    if (titleValue && !currentSlug && !isEdit) {
      form.setValue("slug", slugify(titleValue), { shouldValidate: true })
    }
  }, [titleValue, form, isEdit])

  // Clear published_at if status is not SCHEDULED
  useEffect(() => {
    if (statusValue !== PostStatus.SCHEDULED) {
      form.setValue("published_at", "")
    }
  }, [statusValue, form])

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
    }
  }, [isEdit, itemId, getById])

  useEffect(() => {
    if (getByIdRes.data && isEdit) {
      const data = getByIdRes.data.data
      form.reset({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || "",
        thumbnail: data.thumbnail?._id || "",
        category: data.category?._id || "",
        author: data.author?._id || "",
        status: data.status,
        type: data.type,
        tags: data.tags || [],
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        slug: data.slug || "",
      })

      form.setValue("published_at", toDateTimeLocal(data.published_at))

      if (data.category) {
        setCategory({
          label: data.category.name,
          value: data.category._id,
        })
      }

      if (data.author) {
        setAuthor({
          label: data.author.name,
          value: data.author._id,
        })
      }

      setThumbnail(data.thumbnail)
    }
  }, [getByIdRes.data, isEdit, form])

  const onSubmit = async (data: PostFormValues) => {
    try {
      const payload = {
        ...data,
        thumbnail: thumbnail?._id ?? undefined,
        category: category?.value || data.category,
        author: author?.value || data.author,
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Post updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Post created successfully")
      }

      router.push("/posts")
    } catch (error: unknown) {
      const err = error as { data?: { message?: string; error?: string } }
      toast.error(
        err?.data?.message || err?.data?.error || "Something went wrong"
      )
    }
  }

  const handleCancel = () => {
    router.push("/posts")
  }

  return {
    form,
    thumbnail,
    setThumbnail,
    category,
    setCategory,
    author,
    setAuthor,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleCancel,
    handleGenerateSlug,
  }
}
