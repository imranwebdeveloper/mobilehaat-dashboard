import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { MediaPicker } from "../media/MediaPicker"
import { useCustomForm } from "./useCustomForm"
import { IMedia } from "../media/media.type"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuthorStatus } from "./authors.type"

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
      title={isEdit ? "Edit Author" : "Create Author"}
      description={
        isEdit
          ? "Update author information."
          : "Fill in the form below to create a new author."
      }
    >
      <form className="mx-auto mb-4 max-w-3xl space-y-4">
        <FieldSet>
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <MediaPicker
                onChange={(media) => {
                  setAvatar(media as IMedia)
                }}
                value={avatar}
                placeholder="Add avatar"
              />
            </div>
          </div>

          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="Name"
              required
              error={form.formState.errors.name?.message}
            >
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input {...field} placeholder="Author name" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Designation"
              error={form.formState.errors.designation?.message}
            >
              <Controller
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g. Senior Editor, Tech Reviewer"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Bio"
              error={form.formState.errors.bio?.message}
            >
              <Controller
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Short bio about the author"
                    rows={3}
                  />
                )}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-2 gap-4">
              <FormFieldWrapper
                label="Status"
                error={form.formState.errors.status?.message}
                required
              >
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AuthorStatus.ACTIVE}>
                          Active
                        </SelectItem>
                        <SelectItem value={AuthorStatus.INACTIVE}>
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormFieldWrapper>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Social Links
              </p>

              <FormFieldWrapper
                label="Twitter"
                error={form.formState.errors.social_links?.twitter?.message}
              >
                <Controller
                  control={form.control}
                  name="social_links.twitter"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://twitter.com/username"
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="LinkedIn"
                error={form.formState.errors.social_links?.linkedin?.message}
              >
                <Controller
                  control={form.control}
                  name="social_links.linkedin"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/in/username"
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Website"
                error={form.formState.errors.social_links?.website?.message}
              >
                <Controller
                  control={form.control}
                  name="social_links.website"
                  render={({ field }) => (
                    <Input {...field} placeholder="https://example.com" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Facebook"
                error={form.formState.errors.social_links?.facebook?.message}
              >
                <Controller
                  control={form.control}
                  name="social_links.facebook"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://facebook.com/username"
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
