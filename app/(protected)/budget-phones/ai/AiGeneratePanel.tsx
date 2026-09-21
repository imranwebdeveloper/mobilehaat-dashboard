/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Loader2,
  Sparkles,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Pencil,
  Check,
  FileText,
  MessageSquare,
  Phone,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAiPreviewMutation, useAiGenerateMutation } from "./ai.api"
import { mapAiToBudgetPhoneForm } from "./mapToFormValues"
import {
  BudgetPhoneFormDraft,
  AiPreviewRankingResponse,
  AiGenerateRanking,
  AiGenerateFaq,
} from "./ai.types"
import { cn } from "@/lib/utils"
import { AsyncSingleSelect } from "@/components/common/select/AsyncSelect"

interface AiGeneratePanelProps {
  onFillForm: (draft: BudgetPhoneFormDraft) => void
}

interface SelectedPhone {
  rank: number
  phone_id: string
  label: string
}

type Step = "input" | "preview" | "generated"

const STEPS = [
  { key: "input" as const, label: "Input", icon: FileText },
  { key: "preview" as const, label: "Clean & Review", icon: Wand2 },
  { key: "generated" as const, label: "Generated", icon: Sparkles },
]

export default function AiGeneratePanel({ onFillForm }: AiGeneratePanelProps) {
  const [rawTranscript, setRawTranscript] = useState("")
  const [cleanedTranscript, setCleanedTranscript] = useState<string>("")
  const [originalTranscript, setOriginalTranscript] = useState("")
  const [selectedPhones, setSelectedPhones] = useState<SelectedPhone[]>([])
  const [step, setStep] = useState<Step>("input")

  const [aiPreview, { isLoading: isPreviewing }] = useAiPreviewMutation()
  const [generate, { isLoading: isGenerating }] = useAiGenerateMutation()

  const [cleanResponse, setCleanResponse] = useState<any>(null)
  const [previewRankings, setPreviewRankings] = useState<
    AiPreviewRankingResponse[] | null
  >(null)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<Record<number, boolean>>({})

  const isBusy = isPreviewing || isGenerating

  const addPhone = () => {
    setSelectedPhones((prev) => [
      ...prev,
      { rank: prev.length + 1, phone_id: "", label: "" },
    ])
  }

  const removePhone = (index: number) => {
    setSelectedPhones((prev) =>
      prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, rank: i + 1 }))
    )
  }

  const updatePhone = (
    index: number,
    field: keyof SelectedPhone,
    value: any
  ) => {
    setSelectedPhones((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const getPhoneIds = () =>
    selectedPhones
      .filter((p) => p.phone_id)
      .map((p) => ({ rank: p.rank, phone_id: p.phone_id }))

  const getPhoneNameById = (phoneId: string) => {
    const found = selectedPhones.find((p) => p.phone_id === phoneId)
    return found?.label || phoneId.slice(0, 8) + "..."
  }

  const handlePreview = async () => {
    if (!rawTranscript.trim()) {
      toast.error("Paste the video transcript to clean")
      return
    }

    const phoneIds = getPhoneIds()

    if (phoneIds.length === 0) {
      toast.error("Select at least one phone to generate ranking")
      return
    }

    try {
      const envelope: any = await aiPreview({
        phone_ids: phoneIds,
        transcript: rawTranscript.trim(),
      }).unwrap()
      const result = envelope.data ?? envelope
      setOriginalTranscript(result.original_transcript || rawTranscript)
      setCleanedTranscript(result.cleaned_transcript || rawTranscript)
      setPreviewRankings(result.rankings || null)
      setCleanResponse(result)
      setGeneratedData(null)
      setStep("preview")
      toast.success("Transcript cleaned — review and edit, then generate")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Cleaning failed")
    }
  }

  const handleRegenerate = async () => {
    if (!rawTranscript.trim()) return

    const phoneIds = getPhoneIds()

    try {
      const envelope: any = await aiPreview({
        phone_ids: phoneIds,
        transcript: rawTranscript.trim(),
      }).unwrap()
      const result = envelope.data ?? envelope
      setCleanedTranscript(result.cleaned_transcript || rawTranscript)
      setPreviewRankings(result.rankings || null)
      setCleanResponse(result)
      toast.success("Transcript re-cleaned")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Regenerate failed")
    }
  }

  const handleGenerate = async () => {
    if (!cleanedTranscript.trim()) {
      toast.error("Cleaned transcript is empty")
      return
    }

    const phoneIds = getPhoneIds()

    try {
      const envelope: any = await generate({
        phone_ids: phoneIds,
        transcript: cleanedTranscript.trim(),
        language: "bn",
      }).unwrap()
      const result = envelope.data ?? envelope
      setGeneratedData(result)
      setStep("generated")
      toast.success("Content generated — review before filling form")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Generation failed")
    }
  }

  const handleFillForm = () => {
    if (!generatedData) return
    const draft = mapAiToBudgetPhoneForm(generatedData)
    draft.rankings = draft.rankings.map((r) => {
      const selected = selectedPhones.find((p) => p.phone_id === r.phone_id)
      return { ...r, label: selected?.label || "" }
    })
    onFillForm(draft)
    toast.success("Form filled — review before saving")
  }

  const goToStep1 = () => {
    if (cleanedTranscript) {
      setRawTranscript(cleanedTranscript)
    }
    setStep("input")
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="space-y-5">
      {/* Pipeline Flow Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const isActive = step === s.key
          const isDone = idx < stepIndex
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isActive
                      ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/25"
                      : isDone
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium transition-colors sm:inline",
                    isActive
                      ? "text-amber-600 dark:text-amber-400"
                      : isDone
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      idx < stepIndex
                        ? "w-full bg-green-500"
                        : "w-0 bg-transparent"
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left: Phone Selection (hidden in input step) */}
        {step !== "input" && (
          <div className="lg:w-72">
            <Card className="lg:sticky lg:top-4">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Phones</span>
                      {selectedPhones.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          {selectedPhones.length}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={addPhone}
                      className="h-7 text-xs"
                      disabled={isBusy}
                    >
                      + Add
                    </Button>
                  </div>

                  {/* Phone List */}
                  {selectedPhones.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                      <Phone className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        No phones selected yet.
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        Add phones to define ranking order.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPhones.map((phone, index) => (
                        <div
                          key={index}
                          className="group flex items-start gap-2 rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                            {phone.rank}
                          </span>
                          <div className="min-w-0 flex-1">
                            <AsyncSingleSelect
                              url="/phones"
                              labelField="title"
                              value={
                                phone.phone_id
                                  ? {
                                      value: phone.phone_id,
                                      label: phone.label,
                                    }
                                  : null
                              }
                              onChange={(val) => {
                                if (val) {
                                  updatePhone(
                                    index,
                                    "phone_id",
                                    val.value as string
                                  )
                                  updatePhone(
                                    index,
                                    "label",
                                    val.label as string
                                  )
                                }
                              }}
                              placeholder="Search phone..."
                              searchField="title"
                              valueField="_id"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePhone(index)}
                            className="mt-1 shrink-0 rounded p-1 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            disabled={isBusy}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick info when phones are selected */}
                  {selectedPhones.length > 0 && (
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <p className="mb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        Ranking
                      </p>
                      <div className="space-y-1">
                        {selectedPhones
                          .filter((p) => p.phone_id)
                          .map((p) => (
                            <div
                              key={p.rank}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="font-mono font-bold text-primary">
                                #{p.rank}
                              </span>
                              <span className="truncate text-muted-foreground">
                                {p.label || "Unnamed"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right: Main Workspace */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Step 1: Input */}
          {step === "input" && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {/* Phone Selection - Now in Step 1 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          Selected Phones
                        </span>
                        {selectedPhones.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {selectedPhones.length}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addPhone}
                        className="h-7 text-xs"
                        disabled={isBusy}
                      >
                        + Add Phone
                      </Button>
                    </div>

                    {/* Phone List */}
                    {selectedPhones.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center">
                        <Phone className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                        <p className="text-xs text-muted-foreground">
                          No phones selected yet.
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          Add phones to define ranking order.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedPhones.map((phone, index) => (
                          <div
                            key={index}
                            className="group flex items-start gap-2 rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                          >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                              {phone.rank}
                            </span>
                            <div className="min-w-0 flex-1">
                              <AsyncSingleSelect
                                url="/phones"
                                labelField="title"
                                value={
                                  phone.phone_id
                                    ? {
                                        value: phone.phone_id,
                                        label: phone.label,
                                      }
                                    : null
                                }
                                onChange={(val) => {
                                  if (val) {
                                    updatePhone(
                                      index,
                                      "phone_id",
                                      val.value as string
                                    )
                                    updatePhone(
                                      index,
                                      "label",
                                      val.label as string
                                    )
                                  }
                                }}
                                placeholder="Search phone..."
                                searchField="title"
                                valueField="_id"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhone(index)}
                              className="mt-1 shrink-0 rounded p-1 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                              disabled={isBusy}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t" />

                  {/* Transcript Section */}
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Video Transcript
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Paste the raw STT transcript. The AI will fix errors,
                      punctuation, and phone names using the Phone DB. Rich text
                      editing is supported.
                    </p>
                  </div>

                  <div className="relative">
                    <Textarea
                      placeholder={
                        'Paste raw transcript here...\n\nExample: " Honor 200 Pro ta onek i valo phone. Camera ta excellnet. Battery 5200 mAh ar fast charging ase..."'
                      }
                      value={rawTranscript}
                      onChange={(e) => setRawTranscript(e.target.value)}
                      rows={14}
                      className="resize-y font-mono text-sm"
                      disabled={isBusy}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono text-[11px] tabular-nums",
                          rawTranscript.length > 15000
                            ? "font-medium text-destructive"
                            : rawTranscript.length < 20 &&
                                rawTranscript.length > 0
                              ? "text-amber-500"
                              : "text-muted-foreground/60"
                        )}
                      >
                        {rawTranscript.length.toLocaleString()} / 15,000
                      </span>
                    </div>
                  </div>

                  {rawTranscript.length > 0 && rawTranscript.length < 20 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Transcript too short — minimum 20 characters required.
                    </p>
                  )}

                  <Button
                    type="button"
                    onClick={() => void handlePreview()}
                    disabled={
                      isBusy ||
                      !rawTranscript.trim() ||
                      selectedPhones.filter((p) => p.phone_id).length === 0
                    }
                    className="w-full"
                    size="lg"
                  >
                    {isPreviewing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cleaning transcript...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Clean & Preview
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Clean Review */}
          {step === "preview" && (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Header with compare toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                          <Pencil className="h-4 w-4 text-amber-500" />
                          Cleaned Transcript
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Review the AI-cleaned text. Edit freely — this is what
                          the content generator will use.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOriginal((v) => !v)}
                        className="shrink-0 text-xs"
                      >
                        {showOriginal ? (
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                        ) : (
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {showOriginal ? "Hide" : "Show"} Original
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleRegenerate()}
                        disabled={isBusy}
                        className="shrink-0 text-xs"
                      >
                        {isPreviewing ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Re-clean
                      </Button>
                    </div>

                    {/* Original transcript (collapsible) */}
                    {showOriginal && (
                      <div className="overflow-hidden rounded-lg border bg-muted/30">
                        <div className="border-b bg-muted/50 px-3 py-2">
                          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Original (read-only)
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-3">
                          <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {originalTranscript}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cleaned transcript (editable) */}
                    <div>
                      <Textarea
                        value={cleanedTranscript}
                        onChange={(e) => setCleanedTranscript(e.target.value)}
                        rows={14}
                        placeholder="Cleaned transcript will appear here..."
                        className="resize-y font-mono text-sm"
                        disabled={isBusy}
                      />
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground/60">
                          Edit above — changes are kept when you generate
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground/60 tabular-nums">
                          {cleanedTranscript.length.toLocaleString()} chars
                        </span>
                      </div>
                    </div>

                    {/* Cleaned result info */}
                    {cleanResponse && (
                      <div className="overflow-hidden rounded-lg border">
                        <div className="border-b bg-muted/50 px-3 py-2">
                          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Cleaned Text (
                            {cleanResponse.cleaned_transcript.length.toLocaleString()}{" "}
                            chars)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Phone Specs Preview */}
                    {previewRankings && previewRankings.length > 0 && (
                      <div className="overflow-hidden rounded-lg border">
                        <div className="border-b bg-muted/50 px-3 py-2">
                          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Phone Specs ({previewRankings.length})
                          </span>
                        </div>
                        <div className="grid gap-3 p-3 sm:grid-cols-2">
                          {previewRankings.map((r) => (
                            <div
                              key={r.phone_id}
                              className="rounded-md border bg-muted/20 p-2.5"
                            >
                              <div className="mb-1.5 flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                  {r.rank}
                                </span>
                                <span className="truncate text-xs font-medium">
                                  {r.phone_name}
                                </span>
                                {r.phone_brand && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {r.phone_brand}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                                {r.key_specifications.display && (
                                  <div>
                                    <span className="font-medium text-foreground/70">
                                      Display:
                                    </span>{" "}
                                    {r.key_specifications.display}
                                  </div>
                                )}
                                {r.key_specifications.performance && (
                                  <div>
                                    <span className="font-medium text-foreground/70">
                                      Performance:
                                    </span>{" "}
                                    {r.key_specifications.performance}
                                  </div>
                                )}
                                {r.key_specifications.camera && (
                                  <div>
                                    <span className="font-medium text-foreground/70">
                                      Camera:
                                    </span>{" "}
                                    {r.key_specifications.camera}
                                  </div>
                                )}
                                {r.key_specifications.battery && (
                                  <div>
                                    <span className="font-medium text-foreground/70">
                                      Battery:
                                    </span>{" "}
                                    {r.key_specifications.battery}
                                  </div>
                                )}
                                {r.key_specifications.design && (
                                  <div>
                                    <span className="font-medium text-foreground/70">
                                      Design:
                                    </span>{" "}
                                    {r.key_specifications.design}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => goToStep1()}
                        disabled={isBusy}
                      >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void handleGenerate()}
                        disabled={isBusy || !cleanedTranscript.trim()}
                        className="flex-1"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating content...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate SEO Content
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Generated Content */}
          {step === "generated" && generatedData && (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Generated Content
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          AI-generated SEO content based on the cleaned
                          transcript. Review before filling the form.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => goToStep1()}
                        className="shrink-0"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Edit Transcript
                      </Button>
                    </div>

                    {/* Title & Description */}
                    <div className="overflow-hidden rounded-lg border">
                      <div className="border-b bg-muted/50 px-3 py-2">
                        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                          Article Title & Description
                        </span>
                      </div>
                      <div className="space-y-2 p-3">
                        <h4 className="text-base leading-snug font-semibold">
                          {generatedData.title}
                        </h4>
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {generatedData.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick Verdict */}
                    {generatedData.quick_verdict && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20">
                        <span className="text-[11px] font-medium tracking-wider text-amber-600 uppercase dark:text-amber-400">
                          Quick Verdict
                        </span>
                        <p className="mt-1 text-sm leading-relaxed font-medium">
                          {generatedData.quick_verdict}
                        </p>
                      </div>
                    )}

                    {/* SEO Meta */}
                    <div className="overflow-hidden rounded-lg border">
                      <div className="border-b bg-muted/50 px-3 py-2">
                        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                          SEO Metadata
                        </span>
                      </div>
                      <div className="space-y-2.5 p-3">
                        {generatedData.meta_title && (
                          <div>
                            <span className="text-[11px] text-muted-foreground">
                              Meta Title
                            </span>
                            <p className="text-sm font-medium">
                              {generatedData.meta_title}
                            </p>
                          </div>
                        )}
                        {generatedData.meta_description && (
                          <div>
                            <span className="text-[11px] text-muted-foreground">
                              Meta Description
                            </span>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {generatedData.meta_description}
                            </p>
                          </div>
                        )}
                        {generatedData.meta_keywords && (
                          <div>
                            <span className="text-[11px] text-muted-foreground">
                              Keywords
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {generatedData.meta_keywords}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-4 pt-1">
                          {generatedData.min_price != null && (
                            <div>
                              <span className="text-[11px] text-muted-foreground">
                                Min Price
                              </span>
                              <p className="font-mono text-sm font-semibold">
                                ৳{generatedData.min_price?.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {generatedData.max_price != null && (
                            <div>
                              <span className="text-[11px] text-muted-foreground">
                                Max Price
                              </span>
                              <p className="font-mono text-sm font-semibold">
                                ৳{generatedData.max_price?.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rankings & Verdicts */}
                    {generatedData.rankings?.length > 0 && (
                      <div className="overflow-hidden rounded-lg border">
                        <div className="border-b bg-muted/50 px-3 py-2">
                          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Rankings & Verdicts
                          </span>
                        </div>
                        <div className="divide-y">
                          {generatedData.rankings.map(
                            (r: AiGenerateRanking) => (
                              <div key={r.rank} className="px-3 py-2.5">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                    {r.rank}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {getPhoneNameById(r.phone_id)}
                                  </span>
                                </div>
                                <p className="line-clamp-4 pl-7 text-xs leading-relaxed text-muted-foreground">
                                  {r.verdict}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* FAQ */}
                    {generatedData.faq?.length > 0 && (
                      <div className="overflow-hidden rounded-lg border">
                        <div className="border-b bg-muted/50 px-3 py-2">
                          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            FAQ ({generatedData.faq.length})
                          </span>
                        </div>
                        <div className="divide-y">
                          {generatedData.faq.map(
                            (f: AiGenerateFaq, i: number) => (
                              <div key={i}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedFaq((prev) => ({
                                      ...prev,
                                      [i]: !prev[i],
                                    }))
                                  }
                                  className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-muted/30"
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <span className="truncate text-sm font-medium">
                                      {f.question}
                                    </span>
                                  </div>
                                  {expandedFaq[i] ? (
                                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  )}
                                </button>
                                {expandedFaq[i] && (
                                  <div className="px-3 pb-3 pl-9">
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                      {f.answer}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fill Form CTA */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => goToStep1()}
                        disabled={isBusy}
                      >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void handleFillForm()}
                        size="lg"
                        className="flex-1"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Fill Form with This Content
                      </Button>
                    </div>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Fills the budget-phone form below. Review all fields
                      before saving.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {(isPreviewing || isGenerating) && step === "input" && (
        <Card>
          <CardContent className="pt-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-muted" />
                    <div className="h-8 flex-1 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
