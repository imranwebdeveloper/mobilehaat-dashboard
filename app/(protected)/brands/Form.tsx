import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { MediaPicker } from "../media/MediaPicker"
import { useCustomForm } from "./useCustomForm"
import { IMedia } from "../media/media.type"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BrandStatus } from "./brands.type"

export default function Form() {
  const {
    form,
    logo,
    setLogo,
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
      title={isEdit ? "Edit Brand" : "Create Brand"}
      description={
        isEdit
          ? "Update brand information."
          : "Fill in the form below to create a new brand."
      }
    >
      <form className="mx-auto mb-4 max-w-3xl space-y-4">
        <FieldSet>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-2 block text-sm font-medium">Logo</label>
              <MediaPicker
                onChange={(media) => {
                  setLogo(media as IMedia)
                }}
                value={logo}
                placeholder="Add logo"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-2 block text-sm font-medium">
                Thumbnail
              </label>
              <MediaPicker
                onChange={(media) => {
                  setThumbnail(media as IMedia)
                }}
                value={thumbnail}
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
                  <Input {...field} placeholder="Brand name" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Slug"
              error={form.formState.errors.slug?.message}
            >
              <Controller
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <Input {...field} placeholder="brand-slug (optional)" />
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
                  <Textarea {...field} placeholder="Short description" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="About"
              error={form.formState.errors.about?.message}
            >
              <Controller
                control={form.control}
                name="about"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Detailed about information"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Official Site Links"
              error={form.formState.errors.official_site_links?.message}
            >
              <Controller
                control={form.control}
                name="official_site_links"
                render={({ field }) => (
                  <Input {...field} placeholder="https://example.com" />
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BrandStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={BrandStatus.INACTIVE}>
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
                    placeholder="Display order (e.g. 1, 2, 3)"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormFieldWrapper>

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
                  <Input
                    {...field}
                    placeholder="keyword1, keyword2, keyword3"
                  />
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
