import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { brandSchema, BrandFormValues } from "./brands.dto"
import { brandApi } from "./brands.api"
import { IMedia } from "../media/media.type"
import { BrandStatus } from "./brands.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: BrandFormValues = {
  name: "",
  slug: "",
  description: "",
  about: "",
  meta_title: "",
  meta_description: "",
  official_site_links: "",
  meta_keywords: "",
  logo: "",
  thumbnail: "",
  status: BrandStatus.ACTIVE,
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
  const [logo, setLogo] = useState<IMedia | undefined>()
  const [thumbnail, setThumbnail] = useState<IMedia | undefined>()
  const { action, itemId, resetAction } = useModalContext()
  const isEdit = action === "edit"

  const [create, createRes] = brandApi.useCreateBrandMutation()
  const [update, updateRes] = brandApi.useUpdateBrandMutation()
  const [getById, getByIdRes] = brandApi.useLazyGetBrandByIdQuery()

  const schema = useMemo(() => brandSchema(), [])

  const form = useForm<BrandFormValues>({
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
            about: data.about || "",
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || "",
            official_site_links: data.official_site_links || "",
            status: data.status,
            order: data.order || 0,
            is_featured: data.is_featured || false,
          })

          setLogo(
            data.logo && typeof data.logo !== "string" ? data.logo : undefined
          )
          setThumbnail(
            data.thumbnail && typeof data.thumbnail !== "string"
              ? data.thumbnail
              : undefined
          )
        })
    }
  }, [isEdit, itemId, getById, form])

  const onSubmit = async (data: BrandFormValues) => {
    try {
      const payload = {
        ...data,
        order: Number(data.order),
        ...(logo?._id && { logo: logo._id }),
        thumbnail: thumbnail?._id ?? undefined,
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Brand updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Brand created successfully")
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
    setLogo(undefined)
    setThumbnail(undefined)
    resetAction()
  }

  return {
    form,
    logo,
    setLogo,
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
