/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { userSchema, UserFormValues } from "./users.dto"
import { userApi } from "./users.api"
import { IMedia } from "../media/media.type"
import { useModalContext } from "@/hooks/useModalContext"
const defaultValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  roles: [],
  is_active: true,
  is_verified: true,
  address: "",
  country: "",
  gender: "other",
  phone_number: "",
  avatar: "",
}

export const useCustomForm = () => {
  const [prevItemId, setPrevItemId] = useState<string | null>(null)
  const [avatarOverride, setAvatarOverride] = useState<IMedia | undefined>()
  const { action, itemId, resetAction } = useModalContext()
  const isEdit = action === "edit"

  const [create, createRes] = userApi.useCreateUserMutation()
  const [update, updateRes] = userApi.useUpdateUserMutation()
  const [getById, getByIdRes] = userApi.useLazyGetUserByIdQuery()

  const loadedData = isEdit ? getByIdRes.data?.data : undefined

  const avatar = useMemo(() => {
    if (avatarOverride) return avatarOverride
    if (isEdit && action === "edit" && loadedData?.avatar)
      return loadedData.avatar as IMedia
    return undefined
  }, [avatarOverride, isEdit, action, loadedData])

  if (itemId !== prevItemId) {
    setPrevItemId(itemId)
    setAvatarOverride(undefined)
  }

  const schema = useMemo(() => userSchema(isEdit), [isEdit])

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
    }
  }, [isEdit, itemId, getById])

  useEffect(() => {
    if (getByIdRes.data && isEdit && action === "edit") {
      const data = getByIdRes.data.data
      form.reset({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        roles: data.roles?.map((r: any) => r._id) || [],
        is_active: data.is_active,
        is_verified: data.is_verified,
        address: data.address,
        gender: data.gender,
        country: data.country,
        phone_number: data.phone_number || "",
        password: "",
      })
    }
  }, [getByIdRes.data, isEdit, action, form])

  const onSubmit = async (data: UserFormValues) => {
    try {
      const payload: any = {
        ...data,
        ...(avatar?._id && { avatar: avatar._id }),
      }

      if (isEdit && itemId) {
        if (!data.password) delete payload.password

        await update({ id: itemId, body: payload }).unwrap()
        toast.success("User updated successfully 🚀")
      } else {
        await create(payload).unwrap()
        toast.success("User created successfully 🚀")
      }

      handleClose()
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.data?.error || "Something went wrong ❌"
      )
    }
  }

  const handleClose = () => {
    form.reset(defaultValues)
    setAvatarOverride(undefined)
    resetAction()
  }

  return {
    form,
    avatar,
    setAvatar: setAvatarOverride,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isLoading,
    isEdit,
    handleClose,
    open: action === "create" || action === "edit",
  }
}
