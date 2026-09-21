"use client"

import { Controller, useFieldArray } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ComparisonStatus } from "./comparisons.type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Save,
  X,
  Sparkles,
  Trophy,
  TrendingUp,
  Plus,
  Trash2,
} from "lucide-react"
import FullWidthLoading from "@/components/common/loading/FullWidthLoading"
import { AsyncMultiSelect } from "@/components/common/select/AsyncSelect"
import { JodiRichTextEditor } from "@/components/common/JodiRichTextEditor"
import { MediaPicker } from "../media/MediaPicker"
import { toast } from "sonner"
import { IMedia } from "../media/media.type"

// ─── Scores Card (editable) ─────────────────────────────────────────

function ScoresCard({
  control,
  phoneNameA,
  phoneNameB,
  overallA,
  overallB,
}: {
  control: any
  phoneNameA?: string
  phoneNameB?: string
  overallA: number
  overallB: number
}) {
  const categories = [
    { label: "Display", path: "scores.display" },
    { label: "Performance", path: "scores.performance" },
    { label: "Camera", path: "scores.camera" },
    { label: "Battery", path: "scores.battery" },
    { label: "Design", path: "scores.design" },
    { label: "Value", path: "scores.value" },
  ]

  const shortName = (name?: string) => {
    if (!name) return ""
    const parts = name.split(" ")
    return parts.length > 2 ? parts.slice(-2).join(" ") : name
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_64px_64px] gap-1 text-center text-[10px] font-medium text-muted-foreground uppercase">
          <span />
          <span>{shortName(phoneNameA) || "Phone A"}</span>
          <span>{shortName(phoneNameB) || "Phone B"}</span>
        </div>

        {/* Category rows */}
        {categories.map(({ label, path }) => (
          <Controller
            key={path}
            control={control}
            name={path}
            render={({ field }) => {
              const a = field.value?.phone_a ?? 0
              const b = field.value?.phone_b ?? 0
              const aWin = a > b && Math.abs(a - b) >= 0.1
              const bWin = b > a && Math.abs(a - b) >= 0.1

              return (
                <div className="grid grid-cols-[1fr_64px_64px] items-center gap-1">
                  <span className="text-xs font-medium">{label}</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={a}
                    className={`h-7 text-center font-mono text-xs ${aWin ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                    onChange={(e) =>
                      field.onChange({
                        ...field.value,
                        phone_a: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={b}
                    className={`h-7 text-center font-mono text-xs ${bWin ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                    onChange={(e) =>
                      field.onChange({
                        ...field.value,
                        phone_b: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )
            }}
          />
        ))}

        {/* Overall */}
        <div className="border-t pt-3">
          <Controller
            control={control}
            name="scores.overall"
            render={({ field }) => {
              const a = field.value?.phone_a ?? 0
              const b = field.value?.phone_b ?? 0
              const aWin = a > b && Math.abs(a - b) >= 0.1
              const bWin = b > a && Math.abs(a - b) >= 0.1

              return (
                <div className="grid grid-cols-[1fr_64px_64px] items-center gap-1">
                  <span className="text-xs font-bold">Overall</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={a}
                    className={`h-7 text-center font-mono text-xs font-bold ${aWin ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                    onChange={(e) =>
                      field.onChange({
                        ...field.value,
                        phone_a: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={b}
                    className={`h-7 text-center font-mono text-xs font-bold ${bWin ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                    onChange={(e) =>
                      field.onChange({
                        ...field.value,
                        phone_b: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )
            }}
          />
        </div>

        {/* Best Value */}
        <div className="border-t pt-3">
          <Controller
            control={control}
            name="scores.best_value"
            render={({ field }) => {
              const a = field.value?.phone_a ?? 0
              const b = field.value?.phone_b ?? 0
              const aWin = a > b && Math.abs(a - b) >= 0.1
              const bWin = b > a && Math.abs(a - b) >= 0.1

              return (
                <div className="grid grid-cols-[1fr_64px_64px] items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Best Value
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={a}
                    className={`h-7 text-center font-mono text-xs ${aWin ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                    onChange={(e) =>
                      field.onChange({
                        ...field.value,
                        phone_a: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={b}
                    className={`h-7 text-center font-mono text-xs ${bWin ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : ""}`}
                    onChange={(e) =>
                      field.onChange({
                        ...field.value,
                        phone_b: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Best For Card (editable) ───────────────────────────────────────

function BestForCard({ control }: { control: any }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4" />
          Best For
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormFieldWrapper label="Phone A">
          <Controller
            control={control}
            name="best_for.phone_a"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="e.g. Best for battery life and value"
                className="text-sm"
              />
            )}
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Phone B">
          <Controller
            control={control}
            name="best_for.phone_b"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="e.g. Best for camera and performance"
                className="text-sm"
              />
            )}
          />
        </FormFieldWrapper>
      </CardContent>
    </Card>
  )
}

// ─── FAQ Card ───────────────────────────────────────────────────────

function FaqCard({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">FAQs</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ question: "", answer: "" })}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No FAQs yet. Click &quot;Add&quot; to create one.
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                FAQ {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-6 w-6 p-0 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Controller
              control={control}
              name={`faqs.${index}.question`}
              render={({ field }) => (
                <Input {...field} placeholder="Question" className="text-sm" />
              )}
            />
            <Controller
              control={control}
              name={`faqs.${index}.answer`}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Answer"
                  rows={2}
                  className="text-sm"
                />
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Main Form ──────────────────────────────────────────────────────

export default function Form() {
  const {
    form,
    onSubmit,
    isLoading,
    isEdit,
    handleBack,
    isFetching,
    handleGenerateSlug,
    phones,
    setPhones,
    thumbnail,
    setThumbnail,
    handleGenerateAi,
    isGenerating,
    selectedPhones,
  } = useCustomForm()

  if (isFetching) {
    return <FullWidthLoading />
  }

  return (
    <div className="w-full px-6 py-4">
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error("Form validation errors:", errors)
        const firstError = Object.values(errors)[0]
        const message = (firstError?.message as string) || "Please fix the form errors"
        toast.error(message)
      })} className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>General Information</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAi}
                    disabled={
                      isGenerating ||
                      !selectedPhones ||
                      selectedPhones.length < 2
                    }
                  >
                    {isGenerating ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
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
                        placeholder="iPhone 15 Pro vs Samsung S24 Ultra"
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
                          placeholder="iphone-15-pro-vs-samsung-s24-ultra"
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
                  label="Thumbnail"
                  required
                  error={form.formState.errors.thumbnail?.message}
                >
                  <MediaPicker
                    onChange={(media) => {
                      setThumbnail(media as IMedia)
                      form.setValue("thumbnail", (media as IMedia)?._id, {
                        shouldValidate: true,
                      })
                    }}
                    value={thumbnail}
                    placeholder="Add thumbnail for social sharing"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Phones"
                  required
                  error={form.formState.errors.phones?.message}
                >
                  <Controller
                    control={form.control}
                    name="phones"
                    render={({ field }) => (
                      <AsyncMultiSelect
                        url="/phones"
                        labelField="title"
                        valueField="_id"
                        searchField="title"
                        values={phones}
                        onMultiChange={(values) => {
                          setPhones(values)
                          field.onChange(values.map((item) => item.value))
                        }}
                        placeholder="Select phones to compare"
                      />
                    )}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Intro"
                  error={form.formState.errors.intro?.message}
                >
                  <Controller
                    control={form.control}
                    name="intro"
                    render={({ field }) => (
                      <JodiRichTextEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Comparison introduction..."
                      />
                    )}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Verdict"
                  error={form.formState.errors.verdict?.message}
                >
                  <Controller
                    control={form.control}
                    name="verdict"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Expert verdict..."
                        rows={4}
                      />
                    )}
                  />
                </FormFieldWrapper>
              </CardContent>
            </Card>

            <FaqCard control={form.control} />

            <Card>
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
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
                      <Input {...field} placeholder="Meta title for SEO" />
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
                        placeholder="Meta description for SEO"
                        rows={3}
                      />
                    )}
                  />
                </FormFieldWrapper>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="flex w-full flex-col-reverse gap-4 md:flex-col lg:w-80">
            <div className="flex gap-2">
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
                {isEdit ? "Update" : "Save"}
              </Button>
            </div>

            <ScoresCard
              control={form.control}
              phoneNameA={phones[0]?.label}
              phoneNameB={phones[1]?.label}
              overallA={form.watch("scores.overall.phone_a") ?? 0}
              overallB={form.watch("scores.overall.phone_b") ?? 0}
            />
            <BestForCard control={form.control} />

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormFieldWrapper
                      label="Publish Status"
                      error={form.formState.errors.status?.message}
                    >
                      <Select
                        {...field}
                        onValueChange={(value) => {
                          if (value) {
                            field.onChange(value)
                          }
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ComparisonStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormFieldWrapper>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
