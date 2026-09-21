import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { contactSchema, ContactFormValues } from "./contacts.dto"
import { contactApi } from "./contacts.api"
import { ContactStatus } from "./contacts.type"
import { useModalContext } from "@/hooks/useModalContext"

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  status: ContactStatus.NEW,
  is_read: false,
  admin_notes: "",
}

export const useCustomForm = () => {
  const { action, itemId, resetAction } = useModalContext()
  const isEdit = action === "edit"

  const [update, updateRes] = contactApi.useUpdateContactMutation()
  const [getById, getByIdRes] = contactApi.useLazyGetContactByIdQuery({})

  const schema = useMemo(() => contactSchema(isEdit), [isEdit])

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
    }
  }, [isEdit, itemId, getById])

  useEffect(() => {
    if (getByIdRes.data && action === "edit") {
      const data = getByIdRes.data.data
      form.reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        is_read: data.is_read,
        admin_notes: data.admin_notes || "",
      })
      form.setValue("status", data.status as ContactStatus)
      if (!data.is_read) {
        update({ id: data._id, body: { is_read: true } })
      }
    }
  }, [getByIdRes.data, action, form, update])

  const onSubmit = async (data: ContactFormValues) => {
    try {
      if (isEdit && itemId) {
        await update({ id: itemId, body: data }).unwrap()
        toast.success("Contact updated successfully")
      }
      handleClose()
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || "Something went wrong")
    }
  }

  const handleClose = () => {
    form.reset(defaultValues)
    resetAction()
  }

  return {
    form,
    onSubmit,
    isLoading: updateRes.isLoading,
    isFetching: getByIdRes.isLoading,
    isEdit,
    handleClose,
    open: action === "edit",
  }
}
