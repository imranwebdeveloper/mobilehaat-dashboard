"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormGetValues,
} from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import {
  BEST_PHONE_BADGE_LABELS,
  BestPhoneBadge,
  BestPhoneChangeType,
  BestPhoneStatus,
  BestPhoneTier,
} from "./best-phones.type"
import type { BestPhoneFormValues } from "./best-phones.dto"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  PlusIcon,
  TrashIcon,
  Save,
  X,
  ChevronDown,
  FileJson,
  AlertTriangle,
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
import { cn } from "@/lib/utils"
import { WorkflowImportDialog } from "./WorkflowImportDialog"
import type { WorkflowImport } from "./workflowImport"

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null

// A string[] edited as a textarea, one item per line. Blank lines are kept
// while typing and dropped on save.
function LinesInput({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <Textarea
      value={(value || []).join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      placeholder={placeholder}
      rows={rows}
      className="text-sm"
    />
  )
}

function FaqItem({
  control,
  index,
  onRemove,
}: {
  control: Control<BestPhoneFormValues>
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
                  placeholder="e.g. ৩০,০০০ টাকার মধ্যে official ফোন কোনগুলো?"
                  className="text-sm"
                />
                <FieldError message={fieldState.error?.message} />
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
                <FieldError message={fieldState.error?.message} />
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
  control: Control<BestPhoneFormValues>
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
  const tier = useWatch({
    control,
    name: `rankings.${index}.tier`,
  }) as BestPhoneTier
  const badges = useWatch({
    control,
    name: `rankings.${index}.badges`,
  }) as BestPhoneBadge[] | undefined
  // New (phone-less) items start open, existing ones start collapsed.
  const [open, setOpen] = useState(!phoneId)
  const isFull = tier === BestPhoneTier.FULL

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
          <span className="shrink-0 rounded border px-1.5 text-[10px] text-muted-foreground uppercase">
            {isFull ? "Full" : "Short"}
          </span>
          {!!badges?.length && (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              {badges.map((b) => BEST_PHONE_BADGE_LABELS[b]).join(" · ")}
            </span>
          )}
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_110px_140px]">
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
                  <FieldError message={fieldState.error?.message} />
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
                    placeholder="Rank"
                    className="text-sm"
                  />
                  <FieldError message={fieldState.error?.message} />
                </div>
              )}
            />
            <Controller
              control={control}
              name={`rankings.${index}.tier`}
              render={({ field }) => (
                <SingleSelect
                  options={[
                    { label: "Full card", value: BestPhoneTier.FULL },
                    { label: "Short card", value: BestPhoneTier.SHORT },
                  ]}
                  value={
                    field.value
                      ? {
                          label:
                            field.value === BestPhoneTier.FULL
                              ? "Full card"
                              : "Short card",
                          value: field.value,
                        }
                      : null
                  }
                  onChange={(value) =>
                    field.onChange(value?.value || BestPhoneTier.FULL)
                  }
                  isClearable={false}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name={`rankings.${index}.badges`}
            render={({ field }) => {
              const selected = (field.value || []) as BestPhoneBadge[]
              return (
                <div className="flex flex-wrap gap-2">
                  {Object.values(BestPhoneBadge).map((value) => {
                    const checked = selected.includes(value)
                    return (
                      <label
                        key={value}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
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
                        {BEST_PHONE_BADGE_LABELS[value]}
                      </label>
                    )
                  })}
                </div>
              )
            }}
          />

          <Controller
            control={control}
            name={`rankings.${index}.for_whom`}
            render={({ field, fieldState }) => (
              <div>
                <p className="mb-1 text-xs font-medium">For whom</p>
                <Input
                  {...field}
                  value={(field.value as string) || ""}
                  placeholder="যারা কম খরচে বড় ব্যাটারি আর শক্তিশালী chipset চান"
                  className="text-sm"
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Controller
              control={control}
              name={`rankings.${index}.chips`}
              render={({ field }) => (
                <div>
                  <p className="mb-1 text-xs font-medium">
                    Spec chips (one per line)
                  </p>
                  <LinesInput
                    value={field.value as string[]}
                    onChange={field.onChange}
                    placeholder={
                      "AMOLED 120Hz\nDimensity 7400\n8/128\n7000mAh\n45W"
                    }
                    rows={5}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name={`rankings.${index}.pros`}
              render={({ field }) => (
                <div>
                  <p className="mb-1 text-xs font-medium">
                    ✓ Pros (one per line)
                  </p>
                  <LinesInput
                    value={field.value as string[]}
                    onChange={field.onChange}
                    rows={5}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name={`rankings.${index}.cons`}
              render={({ field, fieldState }) => (
                <div>
                  <p className="mb-1 text-xs font-medium">
                    ✗ Cons (one per line, at least one)
                  </p>
                  <LinesInput
                    value={field.value as string[]}
                    onChange={field.onChange}
                    rows={5}
                  />
                  <FieldError message={fieldState.error?.message} />
                </div>
              )}
            />
          </div>

          {isFull && (
            <Controller
              control={control}
              name={`rankings.${index}.content`}
              render={({ field, fieldState }) => (
                <div>
                  <p className="mb-1 text-xs font-medium">Paragraph</p>
                  <SimpleRichText
                    content={(field.value as string) || ""}
                    onChange={field.onChange}
                    placeholder="Why it is on the list and who it suits..."
                    minHeight={100}
                  />
                  <FieldError message={fieldState.error?.message} />
                </div>
              )}
            />
          )}

          <Controller
            control={control}
            name={`rankings.${index}.editor_note`}
            render={({ field }) => (
              <div>
                <p className="mb-1 text-xs font-medium">
                  Editor&apos;s note (optional)
                </p>
                <Input
                  {...field}
                  value={(field.value as string) || ""}
                  placeholder="Your own one-line opinion"
                  className="text-sm"
                />
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}

const CHANGE_TYPE_OPTIONS = [
  { label: "New", value: BestPhoneChangeType.NEW },
  { label: "Out", value: BestPhoneChangeType.OUT },
  { label: "Moved", value: BestPhoneChangeType.MOVED },
]

function ChangeMonth({
  control,
  getValues,
  index,
  onRemove,
}: {
  control: Control<BestPhoneFormValues>
  getValues: UseFormGetValues<BestPhoneFormValues>
  index: number
  onRemove: () => void
}) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `changes.${index}.items`,
  })

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name={`changes.${index}.month`}
          render={({ field, fieldState }) => (
            <div className="w-36">
              <Input
                {...field}
                type="month"
                value={(field.value as string) || ""}
                className="text-sm"
              />
              <FieldError message={fieldState.error?.message} />
            </div>
          )}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({ type: BestPhoneChangeType.NEW, phone_id: "", text: "" })
          }
        >
          <PlusIcon className="mr-1 h-3 w-3" />
          Item
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="ml-auto h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
        >
          <TrashIcon className="h-3 w-3" />
        </Button>
      </div>

      {fields.map((item, itemIndex) => (
        <div
          key={item.id}
          className="grid grid-cols-1 gap-2 md:grid-cols-[110px_1fr_1.5fr_auto]"
        >
          <Controller
            control={control}
            name={`changes.${index}.items.${itemIndex}.type`}
            render={({ field }) => (
              <SingleSelect
                options={CHANGE_TYPE_OPTIONS}
                value={
                  CHANGE_TYPE_OPTIONS.find((o) => o.value === field.value) ||
                  null
                }
                onChange={(value) =>
                  field.onChange(value?.value || BestPhoneChangeType.NEW)
                }
                isClearable={false}
              />
            )}
          />
          <AsyncSingleSelect
            url="/phones"
            labelField="title"
            value={
              item.phone_id
                ? { value: item.phone_id, label: item.label || "" }
                : null
            }
            onChange={(val) =>
              update(itemIndex, {
                ...item,
                ...getValues(`changes.${index}.items.${itemIndex}`),
                phone_id: val?.value || "",
                label: val?.label || "",
              })
            }
            placeholder="Phone (optional)"
            searchField="title"
            valueField="_id"
          />
          <Controller
            control={control}
            name={`changes.${index}.items.${itemIndex}.text`}
            render={({ field, fieldState }) => (
              <div>
                <Input
                  {...field}
                  value={(field.value as string) || ""}
                  placeholder="Redmi Note 17 4G তালিকায় এসেছে"
                  className="text-sm"
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(itemIndex)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
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
    handleWorkflowImport,
  } = useCustomForm()
  const [isImportOpen, setIsImportOpen] = useState(false)
  // Unresolved phones/author from the last JSON import, shown until dismissed.
  const [importWarnings, setImportWarnings] = useState<string[]>([])

  const handleImport = async (data: WorkflowImport) => {
    const warnings = await handleWorkflowImport(data)
    setImportWarnings(warnings)
    if (warnings.length) {
      toast.warning(
        `Imported with ${warnings.length} warning(s). Review before saving.`
      )
    } else {
      toast.success("Imported. Review the form, pick a thumbnail and save.")
    }
  }

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "rankings",
  })

  const {
    fields: changeFields,
    prepend: changePrepend,
    remove: changeRemove,
  } = useFieldArray({
    control: form.control,
    name: "changes",
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

  const thisMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="w-full px-6 py-4">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 space-y-6">
            {importWarnings.length > 0 && (
              <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Import warnings
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportWarnings([])}
                    className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs">
                  {importWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>General Information</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsImportOpen(true)}
                  >
                    <FileJson className="mr-1 h-3 w-3" />
                    Import cards.json
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
                        placeholder="Best Phone Under 30000 in Bangladesh (November 2026) | ৩০,০০০ টাকার মধ্যে সেরা ১০টি ফোন"
                      />
                    )}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Slug (URL: /best-phone/<slug>)"
                  required
                  error={form.formState.errors.slug?.message}
                >
                  <div className="flex items-center gap-2">
                    <Controller
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <Input {...field} placeholder="under-30000" />
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
                        placeholder="Optional price note..."
                      />
                    )}
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
                        // #1–5 full cards, #6 onwards short
                        tier:
                          fields.length < 5
                            ? BestPhoneTier.FULL
                            : BestPhoneTier.SHORT,
                        badges: [],
                        chips: [],
                        for_whom: "",
                        pros: [],
                        cons: [],
                        content: "",
                        editor_note: "",
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
                    No ranked phones yet. Click &quot;Add Rank&quot; or import
                    cards.json.
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
                        // Current values, not the field snapshot, so a card
                        // typed (or imported) before picking a phone is kept.
                        ...field,
                        ...form.getValues(`rankings.${index}`),
                        phone_id: val?.value || "",
                        label: val?.label || "",
                      })
                    }
                    onRemove={() => remove(index)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* What changed this month */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    What Changed ({changeFields.length} month
                    {changeFields.length === 1 ? "" : "s"})
                  </CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      changePrepend({ month: thisMonth, items: [] })
                    }
                  >
                    <PlusIcon className="mr-1 h-3 w-3" />
                    Add Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {changeFields.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No changes logged yet. Each monthly update adds a month with
                    what came in, went out or moved.
                  </p>
                )}
                {changeFields.map((field, index) => (
                  <ChangeMonth
                    key={field.id}
                    control={form.control}
                    getValues={form.getValues}
                    index={index}
                    onRemove={() => changeRemove(index)}
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
                        options={Object.values(BestPhoneStatus).map((s) => ({
                          label: s,
                          value: s,
                        }))}
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

                <FormFieldWrapper
                  label="Last Reviewed"
                  error={form.formState.errors.last_reviewed_at?.message}
                >
                  <Controller
                    control={form.control}
                    name="last_reviewed_at"
                    render={({ field }) => (
                      <Input {...field} type="date" value={field.value || ""} />
                    )}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Shown as &quot;last updated&quot; on the page. Set it on
                    each monthly review.
                  </p>
                </FormFieldWrapper>

                <div className="grid gap-4">
                  <FormFieldWrapper
                    label="Min Price / floor (BDT)"
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
                    label="Max Price / ceiling (BDT)"
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

                  <FormFieldWrapper
                    label="Tolerance above ceiling (%)"
                    error={form.formState.errors.tolerance_pct?.message}
                  >
                    <Controller
                      control={form.control}
                      name="tolerance_pct"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          value={
                            isNaN(field.value as number)
                              ? ""
                              : ((field.value ?? 5) as number)
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

      <WorkflowImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        hasContent={
          isEdit ||
          !!form.getValues("title") ||
          !!form.getValues("rankings")?.length
        }
        onApply={handleImport}
      />
    </div>
  )
}
