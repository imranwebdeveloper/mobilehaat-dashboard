"use client"

import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useGeneratePhoneMetadataMutation,
  type GeneratedMetadata,
  type GenerateMetadataBody,
} from "./phones.api"

interface MetadataGenerateButtonProps {
  /** Return the snapshot to generate from, or null when required data is missing. */
  buildSnapshot: () => GenerateMetadataBody | null
  /** Receives the generated meta — caller decides what to do with it (preview-fill, etc). */
  onGenerated: (meta: GeneratedMetadata) => void
  missingHint?: string
}

export default function MetadataGenerateButton({
  buildSnapshot,
  onGenerated,
  missingHint = "Fill in the required phone info first",
}: MetadataGenerateButtonProps) {
  const [generate, { isLoading }] = useGeneratePhoneMetadataMutation()

  const handleClick = async () => {
    const snapshot = buildSnapshot()
    if (!snapshot) {
      toast.error(missingHint)
      return
    }

    try {
      const res = await generate(snapshot).unwrap()
      onGenerated(res.data)
      toast.success("Metadata generated — review the fields, then save")
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || "Metadata generation failed")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isLoading}
      onClick={handleClick}
      title="Generate SEO meta tags with AI"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Generating…" : "Generate with AI"}
    </Button>
  )
}
