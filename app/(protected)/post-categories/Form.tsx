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
import { PostCategoryStatus } from "./post-categories.type"
import { Checkbox } from "@/components/ui/checkbox"

export default function Form() {
  const {
    form,
    thumbnail,
    setThumbnail,
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
      title={isEdit ? "Edit Category" : "Create Category"}
      description={
        isEdit
          ? "Update category information."
          : "Fill in the form below to create a new category."
      }
    >
      <form className="mx-auto mb-4 max-w-3xl space-y-4">
        <FieldSet>
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <MediaPicker
                onChange={(media) => {
                  setThumbnail(media as IMedia)
                }}
                value={thumbnail ?? undefined}
                placeholder="Add thumbnail"
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
                  <Input {...field} placeholder="Category name" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea {...field} placeholder="Category description" />
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
                        <SelectItem value={PostCategoryStatus.ACTIVE}>
                          Active
                        </SelectItem>
                        <SelectItem value={PostCategoryStatus.INACTIVE}>
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Order"
                error={form.formState.errors.order?.message}
              >
                <Controller
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Display order"
                      value={field.value as number}
                    />
                  )}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Meta Title"
              error={form.formState.errors.meta_title?.message}
            >
              <Controller
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <Input {...field} placeholder="SEO meta title" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Meta Description"
              error={form.formState.errors.meta_description?.message}
            >
              <Controller
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <Textarea {...field} placeholder="SEO meta description" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Meta Keywords"
              error={form.formState.errors.meta_keywords?.message}
            >
              <Controller
                control={form.control}
                name="meta_keywords"
                render={({ field }) => (
                  <Input {...field} placeholder="SEO meta keywords" />
                )}
              />
            </FormFieldWrapper>

            <div className="flex items-center gap-2 py-2">
              <Controller
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label className="text-sm font-medium">Mark as Featured</label>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </DisplayFormDrawer>
  )
}
