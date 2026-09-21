/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Controller, useFieldArray } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import { BudgetPhoneStatus } from "./budget-phones.type"
import { Button } from "@/components/ui/button"
import { PlusIcon, TrashIcon, Save, X, Sparkles } from "lucide-react"
import { AsyncSingleSelect } from "@/components/common/select/AsyncSelect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaPicker } from "../media/MediaPicker"
import { handleNumberInput } from "@/lib/utils"
import FullWidthLoading from "@/components/common/loading/FullWidthLoading"
import SingleSelect from "@/components/common/select/SingleSelect"
import AiGeneratePanel from "./ai/AiGeneratePanel"
import { BudgetPhoneFormDraft } from "./ai/ai.types"
import { cn } from "@/lib/utils"

type TabType = "manual" | "ai"

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
    setThumbnail,
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

  const [activeTab, setActiveTab] = useState<TabType>("manual")

  if (isFetching) {
    return <FullWidthLoading />
  }

  const handleAiFillForm = (draft: BudgetPhoneFormDraft) => {
    form.setValue("title", draft.title, { shouldValidate: true })
    if (draft.slug) {
      form.setValue("slug", draft.slug, { shouldValidate: true })
    }
    form.setValue("description", draft.description, { shouldValidate: true })
    form.setValue("meta_title", draft.meta_title, { shouldValidate: true })
    form.setValue("meta_description", draft.meta_description, {
      shouldValidate: true,
    })
    form.setValue("meta_keywords", draft.meta_keywords, {
      shouldValidate: true,
    })
    form.setValue("min_price", draft.min_price, { shouldValidate: true })
    form.setValue("max_price", draft.max_price, { shouldValidate: true })

    form.setValue(
      "rankings",
      draft.rankings.map((r) => ({
        rank: r.rank,
        phone_id: r.phone_id,
        verdict: r.verdict,
        label: r.label || "",
      })),
      { shouldValidate: true }
    )

    if (draft.faq && draft.faq.length > 0) {
      form.setValue(
        "faq",
        draft.faq.map((f) => ({
          question: f.question,
          answer: f.answer,
        })),
        { shouldValidate: true }
      )
    }

    setActiveTab("manual")
  }

  return (
    <div className="w-full px-6 py-4">
      <div className="mb-4 flex gap-1 rounded-lg border bg-muted p-1">
        <button
          type="button"
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("manual")}
        >
          Manual Entry
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "ai"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("ai")}
        >
          <Sparkles className="mr-2 inline h-4 w-4" />
          AI Generate
        </button>
      </div>

      {activeTab === "ai" && <AiGeneratePanel onFillForm={handleAiFillForm} />}

      {activeTab === "manual" && (
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
                    label="Description"
                    required
                    error={form.formState.errors.description?.message}
                  >
                    <Controller
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Description of this budget range..."
                          rows={5}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Ranked Phones ({fields.length})
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      append({
                        rank: fields.length + 1,
                        phone_id: "",
                        verdict: "",
                      })
                    }
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Rank
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const ranking = {
                    value: field.phone_id,
                    label: field.label as string,
                  }

                  return (
                    <Card
                      key={field.id}
                      className="relative overflow-hidden border-l-4 border-l-primary"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      <CardHeader className="bg-muted/30 py-2">
                        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                          Rank #{index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 pt-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormFieldWrapper
                            label="Phone"
                            required
                            error={
                              form.formState.errors.rankings?.[index]?.phone_id
                                ?.message
                            }
                          >
                            <Controller
                              control={form.control}
                              name={`rankings.${index}.phone_id`}
                              render={() => (
                                <AsyncSingleSelect
                                  url="/phones"
                                  labelField="title"
                                  value={ranking}
                                  onChange={(val) => {
                                    if (val) {
                                      update(index, {
                                        ...field,
                                        phone_id: val?.value as string,
                                        label: val?.label as string,
                                      })
                                    }
                                  }}
                                  placeholder="Search phone..."
                                  searchField="title"
                                  valueField="_id"
                                />
                              )}
                            />
                          </FormFieldWrapper>

                          <FormFieldWrapper
                            label="Rank Position"
                            required
                            error={
                              form.formState.errors.rankings?.[index]?.rank
                                ?.message
                            }
                          >
                            <Controller
                              control={form.control}
                              name={`rankings.${index}.rank`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value as number}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </FormFieldWrapper>
                        </div>

                        <FormFieldWrapper
                          label="Verdict"
                          error={
                            form.formState.errors.rankings?.[index]?.verdict
                              ?.message
                          }
                        >
                          <Controller
                            control={form.control}
                            name={`rankings.${index}.verdict`}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                value={(field.value as string) || ""}
                                placeholder="এক লাইনে ফোনটির সারসংক্ষেপ লিখুন"
                                rows={3}
                              />
                            )}
                          />
                        </FormFieldWrapper>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    FAQ ({faqFields.length})
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => faqAppend({ question: "", answer: "" })}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>

                {faqFields.map((field, index) => (
                  <Card
                    key={field.id}
                    className="relative overflow-hidden border-l-4 border-l-orange-400"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => faqRemove(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                    <CardHeader className="bg-muted/30 py-2">
                      <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        FAQ #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <FormFieldWrapper
                        label="Question"
                        error={
                          form.formState.errors.faq?.[index]?.question?.message
                        }
                      >
                        <Controller
                          control={form.control}
                          name={`faq.${index}.question`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={(field.value as string) || ""}
                              placeholder="e.g. ৪০,০০০ টাকার মধ্যে কোন ফোনটি সবচেয়ে ভালো?"
                            />
                          )}
                        />
                      </FormFieldWrapper>

                      <FormFieldWrapper
                        label="Answer"
                        error={
                          form.formState.errors.faq?.[index]?.answer?.message
                        }
                      >
                        <Controller
                          control={form.control}
                          name={`faq.${index}.answer`}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              value={(field.value as string) || ""}
                              placeholder="FAQ answer..."
                              rows={3}
                            />
                          )}
                        />
                      </FormFieldWrapper>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                    onChange={(media) => {
                      setThumbnail(media as any)
                      form.setValue("thumbnail", (media as any)?._id || null)
                    }}
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
      )}
    </div>
  )
}
