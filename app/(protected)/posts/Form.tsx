"use client"

import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { MediaPicker } from "../media/MediaPicker"
import { usePostForm } from "./usePostForm"
import { IMedia } from "../media/media.type"
import { FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PostStatus, PostType } from "./posts.type"
import { AsyncSingleSelect } from "@/components/common/select/AsyncSelect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { JodiRichTextEditor } from "@/components/common/JodiRichTextEditor"
import FullWidthLoading from "@/components/common/loading/FullWidthLoading"

export default function PostForm() {
  const {
    form,
    thumbnail,
    setThumbnail,
    onSubmit,
    isLoading,
    isEdit,
    handleCancel,
    category,
    setCategory,
    author,
    setAuthor,
    isFetching,
    handleGenerateSlug,
  } = usePostForm()

  const title = form.watch("title") || ""
  const metaTitle = form.watch("meta_title") || ""
  const metaDescription = form.watch("meta_description") || ""
  const status = form.watch("status")

  if (isFetching) {
    return <FullWidthLoading />
  }

  return (
    <div className="w-full p-6">
      <form
        id="post-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FieldSet>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="w-full space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper
                    label={`Title (${title.length}/200)`}
                    required
                    error={form.formState.errors.title?.message}
                  >
                    <Controller
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <Input {...field} placeholder="Enter post title" />
                      )}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Slug"
                    required
                    error={form.formState.errors.slug?.message}
                  >
                    <div className="flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <Input {...field} placeholder="Enter post slug" />
                        )}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleGenerateSlug}
                      >
                        Generate
                      </Button>
                    </div>
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Excerpt"
                    error={form.formState.errors.excerpt?.message}
                  >
                    <Controller
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Brief summary of the post"
                          rows={3}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO & Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper
                    label={`Meta Title (${metaTitle.length}/200)`}
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
                    label={`Meta Description (${metaDescription.length}/500)`}
                    error={form.formState.errors.meta_description?.message}
                  >
                    <Controller
                      control={form.control}
                      name="meta_description"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="SEO meta description"
                          rows={4}
                        />
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
                </CardContent>
              </Card>

              <div>
                <JodiRichTextEditor
                  content={form.getValues("content")}
                  onChange={(content) => form.setValue("content", content)}
                />
              </div>
            </div>

            <div className="w-full space-y-4 lg:w-sm">
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  form="post-form"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Saving..."
                    : isEdit
                      ? "Update Post"
                      : "Create Post"}
                </Button>
              </div>

              <Card>
                <CardContent>
                  <FormFieldWrapper
                    label="Thumbnail"
                    required
                    error={form.formState.errors.thumbnail?.message}
                  >
                    <MediaPicker
                      onChange={(media) => {
                        setThumbnail(media as IMedia)
                        form.setValue("thumbnail", (media as IMedia)?._id)
                      }}
                      value={thumbnail}
                      placeholder="Add thumbnail"
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <FormFieldWrapper
                    label="Status"
                    required
                    error={form.formState.errors.status?.message}
                  >
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) {
                              field.onChange(value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PostStatus.DRAFT}>
                              Draft
                            </SelectItem>
                            <SelectItem value={PostStatus.PUBLISHED}>
                              Published
                            </SelectItem>
                            <SelectItem value={PostStatus.SCHEDULED}>
                              Scheduled
                            </SelectItem>
                            <SelectItem value={PostStatus.ARCHIVED}>
                              Archived
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormFieldWrapper>

                  {status === PostStatus.SCHEDULED && (
                    <FormFieldWrapper
                      label="Publish Date & Time"
                      required
                      error={form.formState.errors.published_at?.message}
                    >
                      <Controller
                        control={form.control}
                        name="published_at"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="datetime-local"
                            className="w-full"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                  )}

                  <FormFieldWrapper
                    label="Category"
                    required
                    error={form.formState.errors.category?.message}
                  >
                    <AsyncSingleSelect
                      value={category}
                      onChange={(value) => {
                        setCategory(value)
                        form.setValue("category", value?.value || "")
                      }}
                      url="/post-categories"
                      placeholder="Select category"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Author"
                    required
                    error={form.formState.errors.author?.message}
                  >
                    <AsyncSingleSelect
                      value={author}
                      onChange={(value) => {
                        setAuthor(value)
                        form.setValue("author", value?.value || "")
                      }}
                      url="/authors"
                      placeholder="Select author"
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Type"
                    required
                    error={form.formState.errors.type?.message}
                  >
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) {
                              field.onChange(value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PostType.POST}>Post</SelectItem>
                            <SelectItem value={PostType.PAGE}>Page</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormFieldWrapper>

                  <div className="flex items-center gap-2">
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
                    <label className="text-sm font-medium">
                      Mark as Featured
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </FieldSet>
      </form>
    </div>
  )
}
