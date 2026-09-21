import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import AsyncRoleSelect from "@/components/common/select/AsyncRoleSelect"
import { MediaPicker } from "../media/MediaPicker"
import { useCustomForm } from "./useCustomForm"
import { IMedia } from "../media/media.type"
import { FieldGroup, FieldSet } from "@/components/ui/field"

export default function Form() {
  const {
    form,
    avatar,
    setAvatar,
    onSubmit,
    isLoading,
    isEdit,
    handleClose,
    open,
  } = useCustomForm()

  return (
    <DisplayFormDrawer
      onSubmit={form.handleSubmit(onSubmit)}
      onClose={handleClose}
      isLoading={isLoading}
      open={open}
      title={isEdit ? "Edit User" : "Create User"}
      description={
        isEdit
          ? "Update user information."
          : "Fill in the form below to create a new user."
      }
    >
      <form className="mx-auto max-w-3xl space-y-4">
        <FieldSet>
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <MediaPicker
                onChange={(media) => {
                  setAvatar(media as IMedia)
                }}
                value={avatar}
                placeholder="Add profile photo"
              />
            </div>
          </div>

          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="First Name"
              required
              error={form.formState.errors.first_name?.message}
            >
              <Controller
                control={form.control}
                name="first_name"
                render={({ field }) => <Input {...field} placeholder="John" />}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Last Name"
              required
              error={form.formState.errors.last_name?.message}
            >
              <Controller
                control={form.control}
                name="last_name"
                render={({ field }) => <Input {...field} placeholder="Doe" />}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Email"
              required
              error={form.formState.errors.email?.message}
            >
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Input
                    type="email"
                    {...field}
                    placeholder="example@mail.com"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Password"
              required={isEdit}
              error={form.formState.errors.password?.message}
            >
              <Controller
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Input
                    type="password"
                    {...field}
                    placeholder={
                      isEdit
                        ? "Leave blank to keep unchanged"
                        : "Enter password"
                    }
                  />
                )}
              />
            </FormFieldWrapper>
            <FormFieldWrapper
              required
              label="Role"
              error={form.formState.errors.roles?.message}
            >
              <Controller
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <AsyncRoleSelect
                    value={field?.value[0] || undefined}
                    onValueChange={(value) => {
                      field.onChange([value])
                    }}
                    valueKey="_id"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Phone Number"
              error={form.formState.errors.phone_number?.message}
            >
              <Controller
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <Input {...field} placeholder="+8801XXXXXXXXX" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Country">
              <Controller
                control={form.control}
                name="country"
                render={({ field }) => (
                  <Input {...field} placeholder="Bangladesh" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Address">
              <Controller
                control={form.control}
                name="address"
                render={({ field }) => (
                  <Textarea {...field} placeholder="123 Main St, City" />
                )}
              />
            </FormFieldWrapper>
            <div className="flex gap-6 py-2">
              <FormFieldWrapper
                orientation={"horizontal"}
                className="flex flex-row-reverse"
                label="Active"
              >
                <Controller
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                className="flex flex-row-reverse"
                orientation={"horizontal"}
                label="Verified"
              >
                <Controller
                  control={form.control}
                  name="is_verified"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  )}
                />
              </FormFieldWrapper>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </DisplayFormDrawer>
  )
}
