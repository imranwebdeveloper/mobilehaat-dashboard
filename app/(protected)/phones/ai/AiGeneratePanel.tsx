/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Loader2,
  RefreshCw,
  Sparkles,
  FileText,
  Check,
  Send,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useCreateExtractionMutation,
  useGetAllExtractionsQuery,
  useGetExtractionByIdQuery,
  useRegenerateExtractionMutation,
  useGenerateExtractionEditorialMutation,
  useApproveExtractionMutation,
  useDeleteExtractionMutation,
} from "./ai.api"
import { mapAiToFormValues } from "./mapToFormValues"
import {
  MobileExtraction,
  AiExtractionStatus,
  PhoneFormDraft,
} from "./ai.types"
import { cn } from "@/lib/utils"
import { brandApi } from "../../brands/brands.api"
import { SelectOption } from "@/components/common/select/AsyncSelect"

const STATUS_META: Record<
  AiExtractionStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  fetching: { label: "Fetching", className: "bg-blue-500/15 text-blue-600" },
  extracted: {
    label: "Extracted",
    className: "bg-yellow-500/15 text-yellow-600",
  },
  generating: {
    label: "Generating",
    className: "bg-purple-500/15 text-purple-600",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-600",
  },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive" },
}

function StatusPill({ status }: { status: AiExtractionStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.className
      )}
    >
      {status === "fetching" || status === "generating" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : null}
      {meta.label}
    </span>
  )
}

interface AiGeneratePanelProps {
  onFillForm: (draft: PhoneFormDraft) => void
}

export default function AiGeneratePanel({ onFillForm }: AiGeneratePanelProps) {
  const [url, setUrl] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [createExtraction, { isLoading: isCreating }] =
    useCreateExtractionMutation()
  const [regenerateExtraction, { isLoading: isRegenerating }] =
    useRegenerateExtractionMutation()
  const [generateEditorial, { isLoading: isGeneratingEditorial }] =
    useGenerateExtractionEditorialMutation()
  const [approveExtraction, { isLoading: isApproving }] =
    useApproveExtractionMutation()
  const [deleteExtraction, { isLoading: isDeleting }] =
    useDeleteExtractionMutation()
  const [brandLookup, { isLoading: isResolvingBrand }] =
    brandApi.useLazyGetAllBrandQuery()

  const { data: recent = [], isLoading: isLoadingRecent } =
    useGetAllExtractionsQuery({ limit: 10 })

  const isBusy =
    isCreating ||
    isRegenerating ||
    isGeneratingEditorial ||
    isApproving ||
    isDeleting

  const { data: selected } = useGetExtractionByIdQuery(selectedId ?? "", {
    skip: !selectedId,
    pollingInterval: 4000,
  })

  const extraction: MobileExtraction | undefined =
    selected || recent.find((item) => item._id === selectedId)

  useEffect(() => {
    if (!extraction || !extraction._id) return
    if (extraction.status !== "completed" && extraction.status !== "failed") {
      return
    }
    if (extraction.status === "completed") {
      toast.success("Extraction completed")
    } else {
      toast.error(extraction.lastError?.message || "Extraction failed")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraction?.status, extraction?._id])

  const handleGenerate = async () => {
    const trimmed = url.trim()
    if (!trimmed) {
      toast.error("Please enter a GSMArena URL")
      return
    }
    try {
      const result = await createExtraction({ url: trimmed }).unwrap()
      setSelectedId(result._id)
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.error || "Failed to start extraction"
      )
    }
  }

  const handleRegenerate = async () => {
    if (!selectedId) return
    try {
      await regenerateExtraction({ id: selectedId }).unwrap()
      toast.success("Regeneration started")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Regeneration failed")
    }
  }

  const handleGenerateEditorial = async () => {
    if (!selectedId) return
    try {
      await generateEditorial({ id: selectedId }).unwrap()
      toast.success("Editorial generation started")
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.error || "Editorial generation failed"
      )
    }
  }

  const handleApprove = async () => {
    if (!selectedId) return
    try {
      await approveExtraction({ id: selectedId }).unwrap()
      toast.success("Approved. You can now fill the manual form.")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Approval failed")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteExtraction(id).unwrap()
      if (selectedId === id) {
        setSelectedId(null)
      }
      toast.success("Extraction deleted")
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Delete failed")
    }
  }

  const handleFillForm = async () => {
    if (!extraction?.structuredData) return
    const values = mapAiToFormValues(
      extraction.structuredData,
      extraction.editorialData
    )
    let brand: SelectOption | null = null
    const brandName = extraction.structuredData.brand
    if (brandName) {
      try {
        const result = await brandLookup({
          search: brandName,
          limit: 5,
        }).unwrap()
        const match = (result.data || []).find(
          (item) => item.name.toLowerCase() === brandName.toLowerCase()
        )
        if (match) {
          values.brand = match._id || ""
          brand = { label: match.name, value: match._id || "" }
        }
      } catch {
        // Brand resolution is best-effort; the user can pick it manually.
      }
    }
    onFillForm({ values, brand })
    toast.success("Form filled from AI data — review before saving.")
  }

  const canFillForm = Boolean(extraction?.structuredData)
  const isLoadingActive =
    extraction?.status === "pending" ||
    extraction?.status === "fetching" ||
    extraction?.status === "generating"

  const summary = useMemo(() => {
    const data = extraction?.structuredData
    if (!data) return null
    return {
      brand: data.brand,
      model: data.model,
      announced: data.announced,
      released: data.released,
      rating: data.expert_rating,
      price: data.approximate_price_bd,
      chipset: data.platform?.chipset,
      cpu: data.platform?.cpu,
      battery: data.battery?.capacity,
      display: data.display?.type,
      variants: data.variants?.length ?? 0,
    }
  }, [extraction?.structuredData])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            AI Phone Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Paste a GSMArena specs URL (e.g. https://www.gsmarena.com/blackview_shark_8-12510.php)"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleGenerate()
                }
              }}
            />
            <Button onClick={() => void handleGenerate()} disabled={isBusy}>
              {isCreating ? <Loader2 className="animate-spin" /> : <Send />}
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The scraper fetches the page, extracts specs, and asks Gemini to
            build a full structured profile. This may take a minute or two.
          </p>
        </CardContent>
      </Card>

      {extraction ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {extraction.structuredData?.title ||
                    extraction.source?.label ||
                    extraction.normalizedUrl ||
                    extraction.url}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {extraction.source?.label ||
                  extraction.normalizedUrl ||
                  extraction.url
                    ? `${extraction.source?.label || extraction.normalizedUrl || extraction.url}${
                        extraction.createdAt
                          ? ` · ${new Date(extraction.createdAt).toLocaleDateString()}`
                          : ""
                      }`
                    : "—"}
                </span>
              </span>
              <StatusPill status={extraction.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {extraction.lastError ? (
              <p className="text-sm text-destructive">
                {extraction.lastError.message}
              </p>
            ) : null}

            {summary ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Brand</dt>
                  <dd className="font-medium">{summary.brand || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Model</dt>
                  <dd className="font-medium">{summary.model || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Chipset</dt>
                  <dd className="font-medium">{summary.chipset || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">CPU</dt>
                  <dd className="font-medium">{summary.cpu || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Battery</dt>
                  <dd className="font-medium">
                    {summary.battery ? `${summary.battery} mAh` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Variants</dt>
                  <dd className="font-medium">{summary.variants || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Expert Rating</dt>
                  <dd className="font-medium">
                    {summary.rating != null ? `${summary.rating} / 5` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Approx. BDT Price</dt>
                  <dd className="font-medium">
                    {summary.price != null ? `৳${summary.price}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    Announced / Released
                  </dt>
                  <dd className="font-medium">
                    {summary.announced || "—"} / {summary.released || "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isLoadingActive
                  ? "Working…"
                  : "No structured data yet. Generate or regenerate to fetch specs."}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleRegenerate()}
                disabled={!selectedId || isBusy}
              >
                {isRegenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleGenerateEditorial()}
                disabled={!selectedId || isBusy}
              >
                {isGeneratingEditorial ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FileText />
                )}
                {extraction.editorialData
                  ? "Re-run Editorial"
                  : "Generate Editorial"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleApprove()}
                disabled={!selectedId || isBusy || extraction.approved}
              >
                <Check />
                {extraction.approved ? "Approved" : "Approve"}
              </Button>
              <Button
                size="sm"
                onClick={() => void handleFillForm()}
                disabled={!canFillForm || isBusy || isResolvingBrand}
                className="ml-auto"
              >
                {isResolvingBrand ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                Fill Form
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => selectedId && void handleDelete(selectedId)}
                disabled={!selectedId || isBusy}
              >
                {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Delete
              </Button>
            </div>

            {extraction.editorialData ? (
              <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <strong className="block text-foreground">Editorial</strong>
                <p className="truncate">
                  {extraction.editorialData.meta_title}
                </p>
                <p className="mt-1 line-clamp-2">
                  {extraction.editorialData.meta_description}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Recent Extractions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoadingRecent ? (
            <p className="py-2 text-sm text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              No extractions yet. Generate your first one above.
            </p>
          ) : (
            recent.map((item) => (
              <div
                key={item._id}
                className={cn(
                  "flex w-full items-center gap-1 rounded-md pr-1 pl-2 hover:bg-muted",
                  selectedId === item._id && "bg-muted"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(item._id)}
                  className="flex flex-1 items-center justify-between gap-2 rounded-md py-1.5 text-left text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate">
                      {item.structuredData?.title ||
                        item.source?.label ||
                        item.normalizedUrl ||
                        item.url ||
                        item._id}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.source?.label || item.normalizedUrl || item.url ? (
                        <>
                          {item.source?.label || item.normalizedUrl || item.url}
                          {item.createdAt
                            ? ` · ${new Date(item.createdAt).toLocaleDateString()}`
                            : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {item.approved ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : null}
                    <StatusPill status={item.status} />
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => void handleDelete(item._id)}
                  disabled={isBusy}
                  aria-label="Delete extraction"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
