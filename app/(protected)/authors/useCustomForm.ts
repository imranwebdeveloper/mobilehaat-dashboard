import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { authorSchema, AuthorFormValues } from "./authors.dto"
import { authorApi } from "./authors.api"
import { IMedia } from "../media/media.type"
import { AuthorStatus } from "./authors.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: AuthorFormValues = {
  name: "",
  bio: "",
  avatar: "",
  designation: "",
  social_links: {
    twitter: "",
    linkedin: "",
    website: "",
    facebook: "",
  },
  status: AuthorStatus.ACTIVE,
}

export const useCustomForm = () => {
  const [userAvatar, setUserAvatar] = useState<IMedia | undefined>()
  const { action, itemId, resetAction } = useModalContext()
  const isEdit = action === "edit"

  const [create, createRes] = authorApi.useCreateAuthorMutation()
  const [update, updateRes] = authorApi.useUpdateAuthorMutation()
  const [getById, getByIdRes] = authorApi.useLazyGetAuthorByIdQuery()

  const schema = useMemo(() => authorSchema(isEdit), [isEdit])

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
    }
  }, [isEdit, itemId, getById])

  const editData = getByIdRes.data?.data

  useEffect(() => {
    if (editData && action === "edit") {
      form.reset({
        name: editData.name,
        bio: editData.bio || "",
        avatar: editData.avatar?._id || "",
        designation: editData.designation || "",
        social_links: {
          twitter: editData.social_links?.twitter || "",
          linkedin: editData.social_links?.linkedin || "",
          website: editData.social_links?.website || "",
          facebook: editData.social_links?.facebook || "",
        },
        status: editData.status,
      })
    }
  }, [editData, action, form])

  const editAvatar = useMemo<IMedia | undefined>(
    () => (editData?.avatar ? editData.avatar : undefined),
    [editData]
  )

  const avatar = userAvatar ?? editAvatar

  const onSubmit = async (data: AuthorFormValues) => {
    try {
      const payload = {
        ...data,
        ...(avatar?._id && { avatar: avatar._id }),
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Author updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Author created successfully")
      }

      handleClose()
    } catch (error: unknown) {
      const err = error as { data?: { message?: string; error?: string } }
      toast.error(
        err?.data?.message || err?.data?.error || "Something went wrong"
      )
    }
  }

  const handleClose = () => {
    form.reset(defaultValues)
    setUserAvatar(undefined)
    resetAction()
  }

  return {
    form,
    avatar,
    setAvatar: setUserAvatar,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isLoading,
    isEdit,
    handleClose,
    open: action === "create" || action === "edit",
  }
}
