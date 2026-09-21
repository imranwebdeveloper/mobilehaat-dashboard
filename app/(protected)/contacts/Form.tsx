import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContactStatus } from "./contacts.type"

export default function Form() {
  const { form, onSubmit, isLoading, isEdit, handleClose, open } =
    useCustomForm()
  return (
    <DisplayFormDrawer
      onSubmit={form.handleSubmit(onSubmit)}
      onClose={handleClose}
      isLoading={isLoading}
      open={open}
      title={isEdit ? "Edit Contact" : "Contact Details"}
      description={
        isEdit ? "Update contact information." : "View contact details."
      }
    >
      <form className="mx-auto mb-4 max-w-3xl space-y-4">
        <FieldSet>
          <FieldGroup className="grid gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Name"
                error={form.formState.errors.name?.message}
              >
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} disabled placeholder="Name" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Email"
                error={form.formState.errors.email?.message}
              >
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Input {...field} disabled placeholder="Email" />
                  )}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Phone"
                error={form.formState.errors.phone?.message}
              >
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <Input {...field} disabled placeholder="Phone" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Status"
                error={form.formState.errors.status?.message}
                required
              >
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        field.onChange(value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          key={ContactStatus.NEW}
                          value={ContactStatus.NEW}
                        >
                          New
                        </SelectItem>
                        <SelectItem
                          key={ContactStatus.IN_PROGRESS}
                          value={ContactStatus.IN_PROGRESS}
                        >
                          In Progress
                        </SelectItem>
                        <SelectItem
                          key={ContactStatus.RESOLVED}
                          value={ContactStatus.RESOLVED}
                        >
                          Resolved
                        </SelectItem>
                        <SelectItem
                          key={ContactStatus.ARCHIVED}
                          value={ContactStatus.ARCHIVED}
                        >
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Subject"
              error={form.formState.errors.subject?.message}
            >
              <Controller
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <Input {...field} disabled placeholder="Subject" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Message"
              error={form.formState.errors.message?.message}
            >
              <Controller
                control={form.control}
                name="message"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    disabled
                    rows={4}
                    placeholder="Message"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Admin Notes"
              error={form.formState.errors.admin_notes?.message}
            >
              <Controller
                control={form.control}
                name="admin_notes"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Add notes for internal use"
                  />
                )}
              />
            </FormFieldWrapper>
          </FieldGroup>
        </FieldSet>
      </form>
    </DisplayFormDrawer>
  )
}
