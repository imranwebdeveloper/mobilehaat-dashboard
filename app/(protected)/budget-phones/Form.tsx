"use client"

import { useState } from "react"
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
} from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import { BudgetPhoneStatus } from "./budget-phones.type"
import {
  BUDGET_PHONE_BEST_FOR_LABELS,
  BudgetPhoneBestFor,
} from "./budget-phones.type"
import type { BudgetPhoneFormValues } from "./budget-phones.dto"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  PlusIcon,
  TrashIcon,
  Save,
  X,
  ChevronDown,
} from "lucide-react"
import { AsyncSingleSelect } from "@/components/common/select/AsyncSelect"
import type { SelectOption } from "@/components/common/select/AsyncSelect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaPicker } from "../media/MediaPicker"
import type { IMedia } from "../media/media.type"
import { handleNumberInput } from "@/lib/utils"
import FullWidthLoading from "@/components/common/loading/FullWidthLoading"
import SingleSelect from "@/components/common/select/SingleSelect"
import { SimpleRichText } from "@/components/common/SimpleRichText"
import { JodiRichTextEditor } from "@/components/common/JodiRichTextEditor"
import { cn } from "@/lib/utils"

function FaqItem({
  control,
  index,
  onRemove,
}: {
  control: Control<BudgetPhoneFormValues>
  index: number
  onRemove: () => void
}) {
  const question = useWatch({
    control,
    name: `faq.${index}.question`,
  }) as string
  // New (empty) items start open, existing ones start collapsed.
  const [open, setOpen] = useState(!question)

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {question?.trim() || (
              <span className="font-normal text-muted-foreground italic">
                New question…
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 shrink-0 p-0 text-destructive hover:bg-destructive/10"
        >
          <TrashIcon className="h-3 w-3" />
        </Button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-input px-3 py-3">
          <Controller
            control={control}
            name={`faq.${index}.question`}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  value={(field.value as string) || ""}
                  placeholder="e.g. ৪০,০০০ টাকার মধ্যে কোন ফোনটি সবচেয়ে ভালো?"
                  className="text-sm"
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
          <Controller
            control={control}
            name={`faq.${index}.answer`}
            render={({ field, fieldState }) => (
              <>
                <SimpleRichText
                  content={(field.value as string) || ""}
                  onChange={field.onChange}
                  placeholder="FAQ answer..."
                  minHeight={100}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      )}
    </div>
  )
}

function RankItem({
  control,
  index,
  phoneLabel,
  onPhoneChange,
  onRemove,
}: {
  control: Control<BudgetPhoneFormValues>
  index: number
  phoneLabel?: string
  onPhoneChange: (option: SelectOption | null) => void
  onRemove: () => void
}) {
  const phoneId = useWatch({
    control,
    name: `rankings.${index}.phone_id`,
  }) as string
  const rank = useWatch({
    control,
    name: `rankings.${index}.rank`,
  }) as number
  // New (phone-less) items start open, existing ones start collapsed.
  const [open, setOpen] = useState(!phoneId)

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
          {rank || index + 1}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {phoneLabel?.trim() || (
              <span className="font-normal text-muted-foreground italic">
                Select phone…
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 shrink-0 p-0 text-destructive hover:bg-destructive/10"
        >
          <TrashIcon className="h-3 w-3" />
        </Button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-input px-3 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Controller
              control={control}
              name={`rankings.${index}.phone_id`}
              render={({ fieldState }) => (
                <div>
                  <AsyncSingleSelect
                    url="/phones"
                    labelField="title"
                    value={
                      phoneId
                        ? { value: phoneId, label: phoneLabel || "" }
                        : null
                    }
                    onChange={onPhoneChange}
                    placeholder="Search phone..."
                    searchField="title"
                    valueField="_id"
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name={`rankings.${index}.rank`}
              render={({ field, fieldState }) => (
                <div>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    value={(field.value as number) ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Rank position"
                    className="text-sm"
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
          <Controller
            control={control}
            name={`rankings.${index}.content`}
            render={({ field, fieldState }) => (
              <>
                <SimpleRichText
                  content={(field.value as string) || ""}
                  onChange={field.onChange}
                  placeholder="Write the ranking content for this phone..."
                  minHeight={100}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default function Form() {
  const {
    form,
    onSubmit,
    isLoading,
    isEdit,
    handleBack,
    isFetching,
    handleGenerateSlug,
    thumbnail,
    handleThumbnailPick,
    authorOption,
    handleAuthorPick,
  } = useCustomForm()

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "rankings",
  })

  const {
    fields: faqFields,
    append: faqAppend,
    remove: faqRemove,
  } = useFieldArray({
    control: form.control,
    name: "faq",
  })

  if (isFetching) {
    return <FullWidthLoading />
  }

  return (
    <div className="w-full px-6 py-4">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper
                    label="Title"
                    required
                    error={form.formState.errors.title?.message}
                  >
                    <Controller
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Best Phones Under 20,000 BDT"
                        />
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
                          <Input
                            {...field}
                            placeholder="best-phones-under-20000"
                          />
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
                    label="Intro"
                    required
                    error={form.formState.errors.intro?.message}
                  >
                    <Controller
                      control={form.control}
                      name="intro"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Intro of this budget range..."
                          rows={5}
                        />
                      )}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Author"
                    required
                    error={form.formState.errors.author?.message}
                  >
                    <Controller
                      control={form.control}
                      name="author"
                      render={() => (
                        <AsyncSingleSelect
                          url="/authors"
                          value={authorOption}
                          onChange={(val) => handleAuthorPick(val)}
                          placeholder="Select author"
                        />
                      )}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Disclaimer"
                    error={form.formState.errors.disclaimer?.message}
                  >
                    <Controller
                      control={form.control}
                      name="disclaimer"
                      render={({ field }) => (
                        <SimpleRichText
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Optional disclaimer note..."
                        />
                      )}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Key Differences"
                    error={form.formState.errors.key_differences?.message}
                  >
                    <Controller
                      control={form.control}
                      name="key_differences"
                      render={({ field }) => (
                        <JodiRichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Optional key-differences summary..."
                        />
                      )}
                    />
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    label="Best For"
                    error={form.formState.errors.best_for?.message}
                  >
                    <Controller
                      control={form.control}
                      name="best_for"
                      render={({ field }) => {
                        const selected = field.value || []
                        return (
                          <div className="flex flex-wrap gap-2">
                            {Object.values(BudgetPhoneBestFor).map((value) => {
                              const checked = selected.includes(value)
                              return (
                                <label
                                  key={value}
                                  className={cn(
                                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                                    checked
                                      ? "border-primary bg-primary/10 font-medium text-primary"
                                      : "text-muted-foreground hover:border-slate-300 hover:text-foreground"
                                  )}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) =>
                                      field.onChange(
                                        v
                                          ? [...selected, value]
                                          : selected.filter((s) => s !== value)
                                      )
                                    }
                                  />
                                  {BUDGET_PHONE_BEST_FOR_LABELS[value]}
                                </label>
                              )
                            })}
                          </div>
                        )
                      }}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              {/* Ranked Phones */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Ranked Phones ({fields.length})
                    </CardTitle>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        append({
                          rank: fields.length + 1,
                          phone_id: "",
                          content: "",
                        })
                      }
                    >
                      <PlusIcon className="mr-1 h-3 w-3" />
                      Add Rank
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fields.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No ranked phones yet. Click &quot;Add Rank&quot; to add
                      one.
                    </p>
                  )}
                  {fields.map((field, index) => (
                    <RankItem
                      key={field.id}
                      control={form.control}
                      index={index}
                      phoneLabel={field.label as string}
                      onPhoneChange={(val) =>
                        update(index, {
                          ...field,
                          phone_id: val?.value || "",
                          label: val?.label || "",
                        })
                      }
                      onRemove={() => remove(index)}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO &amp; Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper
                    label="Meta Title"
                    error={form.formState.errors.meta_title?.message}
                  >
                    <Controller
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="SEO title"
                        />
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
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="SEO description"
                          rows={3}
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
                          value={field.value || ""}
                          placeholder="keywords separated by commas"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      FAQ ({faqFields.length})
                    </CardTitle>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => faqAppend({ question: "", answer: "" })}
                    >
                      <PlusIcon className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {faqFields.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No FAQs yet. Click &quot;Add&quot; to create one.
                    </p>
                  )}
                  {faqFields.map((field, index) => (
                    <FaqItem
                      key={field.id}
                      control={form.control}
                      index={index}
                      onRemove={() => faqRemove(index)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="w-full space-y-4 lg:w-[320px]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={handleBack}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaPicker
                    value={thumbnail || undefined}
                    onChange={(media) =>
                      handleThumbnailPick((media as IMedia | null) ?? null)
                    }
                    placeholder="Select thumbnail"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
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
                        <SingleSelect
                          options={Object.values(BudgetPhoneStatus).map(
                            (s) => ({
                              label: s,
                              value: s,
                            })
                          )}
                          value={
                            field.value
                              ? {
                                  label: field.value,
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(value) => {
                            field.onChange(value?.value || null)
                          }}
                          placeholder="Select Status"
                          isClearable={false}
                        />
                      )}
                    />
                  </FormFieldWrapper>

                  <div className="grid gap-4">
                    <FormFieldWrapper
                      label="Min Price (BDT)"
                      required
                      error={form.formState.errors.min_price?.message}
                    >
                      <Controller
                        control={form.control}
                        name="min_price"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            value={
                              isNaN(field.value as number)
                                ? ""
                                : ((field.value ?? 0) as number)
                            }
                            onChange={handleNumberInput(field.onChange)}
                          />
                        )}
                      />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                      label="Max Price (BDT)"
                      required
                      error={form.formState.errors.max_price?.message}
                    >
                      <Controller
                        control={form.control}
                        name="max_price"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            value={
                              isNaN(field.value as number)
                                ? ""
                                : ((field.value ?? 0) as number)
                            }
                            onChange={handleNumberInput(field.onChange)}
                          />
                        )}
                      />
                    </FormFieldWrapper>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
    </div>
  )
}
