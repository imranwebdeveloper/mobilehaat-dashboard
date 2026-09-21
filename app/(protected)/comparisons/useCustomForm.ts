"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { comparisonSchema, ComparisonFormValues } from "./comparisons.dto"
import { comparisonsApi } from "./comparisons.api"
import {
  ComparisonStatus,
  ComparisonScores,
  ComparisonBestFor,
  ComparisonFaq,
} from "./comparisons.type"
import { slugify } from "@/lib/utils"
import { IPhone } from "../phones/phones.type"
import { IMedia } from "../media/media.type"
import { SelectOption } from "@/components/common/select/AsyncSelect"

const defaultValues: ComparisonFormValues = {
  title: "",
  slug: "",
  phones: [],
  thumbnail: "",
  intro: "",
  verdict: "",
  meta_title: "",
  meta_description: "",
  status: ComparisonStatus.DRAFT,
}

type ApiError = {
  data?: {
    message?: string
    error?: string
  }
}

export const useCustomForm = () => {
  const router = useRouter()
  const params = useParams()

  const itemId = params?.id as string
  const isEdit = !!itemId
  const [phones, setPhones] = useState<SelectOption[]>([])
  const [thumbnail, setThumbnail] = useState<IMedia | undefined>()
  const [scores, setScores] = useState<ComparisonScores | null>(null)
  const [bestFor, setBestFor] = useState<ComparisonBestFor | null>(null)
  const [faqs, setFaqs] = useState<ComparisonFaq[]>([])
  const [create, createRes] = comparisonsApi.useCreateComparisonMutation()
  const [update, updateRes] = comparisonsApi.useUpdateComparisonMutation()
  const [getById, getByIdRes] = comparisonsApi.useLazyGetComparisonByIdQuery()
  const [generateAi, { isLoading: isGenerating }] =
    comparisonsApi.useGenerateComparisonAiMutation()

  const schema = useMemo(() => comparisonSchema(), [])

  const form = useForm<ComparisonFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const titleValue = form.watch("title")
  const selectedPhones = form.watch("phones")

  // Auto-generate slug when title changes if slug is empty and not in edit mode
  useEffect(() => {
    const currentSlug = form.getValues("slug")
    if (titleValue && !currentSlug && !isEdit) {
      form.setValue("slug", slugify(titleValue), { shouldValidate: true })
    }
  }, [titleValue, form, isEdit])

  const handleGenerateSlug = () => {
    const slug = slugify(form.getValues("title") || "")
    form.setValue("slug", slug, { shouldValidate: true })
  }

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
    }
  }, [isEdit, itemId, getById])

  useEffect(() => {
    if (getByIdRes.data && isEdit) {
      const data = getByIdRes.data.data
      form.reset({
        title: data.title || "",
        slug: data.slug || "",
        phones:
          (data.phones as Array<{ _id?: string } | string>)?.map((p) =>
            typeof p === "string" ? p : p._id || ""
          ) || [],
        thumbnail: (data.thumbnail as unknown as { _id?: string })?._id || "",
        intro: data.intro || "",
        verdict: data.verdict || "",
        best_for: data.best_for,
        faqs: data.faqs,
        scores: data.scores,
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        analysisId:
          typeof data.analysisId === "object" && data.analysisId !== null
            ? (data.analysisId as { _id?: string })._id || ""
            : data.analysisId || "",
        status: data.status,
      })

      setThumbnail(data.thumbnail as unknown as IMedia | undefined)
      if (data.scores) setScores(data.scores)
      if (data.best_for) setBestFor(data.best_for)
      if (data.faqs) setFaqs(data.faqs)

      const phones = data.phones.map((p: IPhone) => ({
        label: p.title,
        value: p._id,
      }))
      setPhones(phones)
    }
  }, [form, isEdit, getByIdRes.data])

  const handleGenerateAi = async () => {
    const phoneIds = form.getValues("phones")

    if (!phoneIds || phoneIds.length < 2) {
      toast.error("Select at least 2 phones before generating with AI")
      return
    }

    try {
      const result = await generateAi({
        phone_ids: phoneIds,
      }).unwrap()

      const data = result.data

      if (data.title) {
        form.setValue("title", data.title, { shouldValidate: true })
      }
      if (data.slug) {
        form.setValue("slug", data.slug, { shouldValidate: true })
      }
      if (data.intro) {
        form.setValue("intro", data.intro, { shouldValidate: true })
      }
      if (data.verdict) {
        form.setValue("verdict", data.verdict, { shouldValidate: true })
      }
      if (data.best_for) {
        form.setValue("best_for", data.best_for)
        setBestFor(data.best_for)
      }
      if (data.faqs) {
        form.setValue("faqs", data.faqs)
        setFaqs(data.faqs)
      }
      if (data.scores) {
        form.setValue("scores", data.scores)
        setScores(data.scores)
      }
      if (data.meta_title) {
        form.setValue("meta_title", data.meta_title, { shouldValidate: true })
      }
      if (data.meta_description) {
        form.setValue("meta_description", data.meta_description, {
          shouldValidate: true,
        })
      }
      if (data.analysisId) {
        form.setValue("analysisId", data.analysisId)
      }

      toast.success("Comparison content generated with AI")
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(
        err.data?.message || err.data?.error || "AI generation failed"
      )
    }
  }

  const onSubmit = async (data: ComparisonFormValues) => {
    try {
      if (isEdit && itemId) {
        await update({ id: itemId, body: data }).unwrap()
        toast.success("Comparison updated successfully")
      } else {
        await create(data).unwrap()
        toast.success("Comparison created successfully")
      }

      handleBack()
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(
        err.data?.message || err.data?.error || "Something went wrong"
      )
    }
  }

  const handleBack = () => {
    form.reset(defaultValues)
    setPhones([])
    setThumbnail(undefined)
    setScores(null)
    setBestFor(null)
    setFaqs([])
    router.push("/comparisons")
  }
  return {
    form,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    phones,
    setPhones,
    thumbnail,
    setThumbnail,
    handleBack,
    handleGenerateSlug,
    handleGenerateAi,
    isGenerating,
    selectedPhones,
    scores,
    bestFor,
    faqs,
  }
}
