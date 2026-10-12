/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { budgetPhoneSchema, BudgetPhoneFormValues } from "./budget-phones.dto"
import { budgetPhoneApi } from "./budget-phones.api"
import { BudgetPhoneBestFor, BudgetPhoneStatus } from "./budget-phones.type"
import { IMedia } from "../media/media.type"
import { slugify } from "@/lib/utils"
import { SelectOption } from "@/components/common/select/AsyncSelect"
import { phoneApi } from "../phones/phones.api"
import { globalApi } from "@/store/global.api"
import type { WorkflowImport, WorkflowRanking } from "./workflowImport"

const defaultValues: BudgetPhoneFormValues = {
  title: "",
  slug: "",
  intro: "",
  disclaimer: "",
  key_differences: "",
  author: "",
  best_for: [],
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  thumbnail: null,
  min_price: 0,
  max_price: 0,
  status: BudgetPhoneStatus.ACTIVE,
  rankings: [],
  faq: [],
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
  // Selections made by the user in this session, tagged with the doc they
  // belong to so switching docs never shows a stale selection.
  const [authorPick, setAuthorPick] = useState<{
    key: string | undefined
    option: SelectOption | null
  } | null>(null)
  const [thumbPick, setThumbPick] = useState<{
    key: string | undefined
    media: IMedia | null
  } | null>(null)

  const [create, createRes] = budgetPhoneApi.useCreateBudgetPhoneMutation()
  const [update, updateRes] = budgetPhoneApi.useUpdateBudgetPhoneMutation()
  const [getById, getByIdRes] = budgetPhoneApi.useLazyGetBudgetPhoneByIdQuery()
  const [getPhoneById] = phoneApi.useLazyGetPhoneByIdQuery()
  const [getData] = globalApi.useLazyGetDataQuery()

  const schema = useMemo(() => budgetPhoneSchema(), [])

  const form = useForm<BudgetPhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // Slug is fully manual: type anything in the slug field
  // (e.g. "top mobile under 15k") and Generate converts it
  // to a clean slug (e.g. "top-mobile-under-15k").
  const handleGenerateSlug = () => {
    const slug = slugify(form.getValues("slug") || "")
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
      const rankings = data.rankings?.map((r) => ({
        rank: r.rank,
        phone_id: r.phone?._id || "",
        content: r.content || "",
        label: r.phone?.title,
      }))
      const authorId =
        typeof data.author === "object" && data.author !== null
          ? data.author._id || ""
          : data.author || ""
      form.reset({
        title: data.title || "",
        slug: data.slug || "",
        intro: data.intro || "",
        disclaimer: data.disclaimer || "",
        key_differences: data.key_differences || "",
        author: authorId,
        best_for: data.best_for || [],
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        meta_keywords: data.meta_keywords || "",
        thumbnail: (data.thumbnail as any)?._id || data.thumbnail || null,
        min_price: data.min_price,
        max_price: data.max_price,
        status: data.status,
        rankings: rankings || [],
        faq: data.faq || [],
      })
    }
  }, [form, isEdit, getByIdRes.data])

  // Prefer the user's live pick; fall back to the fetched thumbnail.
  // Derived during render (no effect sync), so refetches never
  // clobber a selection and doc switches never leak a stale one.
  const fetchedThumbnail = getByIdRes.data?.data.thumbnail as
    | IMedia
    | null
    | undefined
  const thumbnail =
    thumbPick && thumbPick.key === itemId
      ? thumbPick.media
      : (fetchedThumbnail ?? null)

  const handleThumbnailPick = (media: IMedia | null) => {
    setThumbPick({ key: itemId, media })
    form.setValue("thumbnail", media?._id || null, {
      shouldValidate: true,
    })
  }

  // Prefer the user's live pick; fall back to the fetched author.
  // Derived during render (no effect sync), so refetches never
  // clobber a selection and doc switches never leak a stale one.
  const fetchedAuthor = getByIdRes.data?.data.author
  let authorOption: SelectOption | null = null
  if (authorPick && authorPick.key === itemId) {
    authorOption = authorPick.option
  } else if (
    fetchedAuthor &&
    typeof fetchedAuthor === "object" &&
    fetchedAuthor._id
  ) {
    authorOption = { label: fetchedAuthor.name || "Author", value: fetchedAuthor._id }
  }

  const handleAuthorPick = (val: SelectOption | null) => {
    setAuthorPick({ key: itemId, option: val })
    form.setValue("author", val?.value || "", { shouldValidate: true })
  }

  // Exact-slug lookup through the generic list endpoint (regex search on
  // the slug field, then an exact match so "x-20" never picks "x-20-pro").
  const findBySlug = async (url: string, slug: string) => {
    try {
      const res = await getData({
        url,
        search: slug,
        searchFields: "slug",
        limit: 20,
      }).unwrap()
      return res.data.find((item) => item?.slug === slug) || null
    } catch {
      return null
    }
  }

  // phone_db_id first (verifies the id still exists); falls back to the
  // phone slug, which also catches phones created after the workflow ran.
  const resolvePhone = async (
    r: WorkflowRanking
  ): Promise<SelectOption | null> => {
    if (r.phone_db_id) {
      try {
        const res = await getPhoneById(r.phone_db_id, true).unwrap()
        if (res.data?._id) {
          return { value: res.data._id, label: res.data.title }
        }
      } catch {
        // Unknown or malformed id: try the slug below.
      }
    }
    if (r.phone_slug) {
      const phone = await findBySlug("/phones", r.phone_slug)
      if (phone?._id) return { value: phone._id, label: phone.title }
    }
    return null
  }

  // Fills the whole form from a workflow 08_publish.json. Thumbnail is
  // left alone; nothing is saved. Returns warnings for anything that could
  // not be resolved, so the form can show them to the editor.
  const handleWorkflowImport = async ({ cms }: WorkflowImport) => {
    const warnings: string[] = []
    const current = form.getValues()

    const phones = await Promise.all(cms.rankings.map(resolvePhone))
    const rankings = cms.rankings.map((r, i) => {
      const phone = phones[i]
      const rank = Number(r.rank) || i + 1
      if (!phone) {
        warnings.push(
          `#${rank} ${r.phone_title || r.phone_slug || "Phone"}: not found in the phone DB. Pick the phone manually (its content was imported).`
        )
      }
      return {
        rank,
        phone_id: phone?.value || "",
        content: r.content_html || "",
        label: phone?.label || "",
      }
    })

    let author = current.author
    let authorOption: SelectOption | null = null
    if (cms.author) {
      const found = await findBySlug("/authors", cms.author)
      if (found?._id) {
        author = found._id
        authorOption = { label: found.name || cms.author, value: found._id }
      } else {
        warnings.push(
          `Author "${cms.author}" not found. The author was left unchanged.`
        )
      }
    }

    const bestForValues = Object.values(BudgetPhoneBestFor) as string[]
    const bestFor = (cms.best_for || []).filter((v) =>
      bestForValues.includes(v)
    ) as BudgetPhoneBestFor[]
    const status = Object.values(BudgetPhoneStatus).find(
      (s) => s === cms.status
    )

    form.reset(
      {
        ...current,
        title: cms.title,
        slug: cms.slug || current.slug,
        intro: cms.intro || "",
        disclaimer: cms.disclaimer_html || "",
        key_differences: cms.key_differences_html || "",
        author,
        best_for: bestFor,
        meta_title: cms.meta_title || "",
        meta_description: cms.meta_description || "",
        meta_keywords: cms.meta_keywords || "",
        min_price: cms.min_price ?? current.min_price,
        max_price: cms.max_price ?? current.max_price,
        status: status || current.status,
        rankings,
        faq: (cms.faq || []).map((f) => ({
          question: f.question,
          answer: f.answer_html || "",
        })),
      },
      { keepDefaultValues: true }
    )
    if (authorOption) {
      setAuthorPick({ key: itemId, option: authorOption })
    }
    return warnings
  }

  const onSubmit = async (data: BudgetPhoneFormValues) => {
    try {
      const payload = {
        ...data,
        thumbnail: thumbnail?._id || data.thumbnail,
        min_price: Number(data.min_price),
        max_price: Number(data.max_price),
        rankings: data.rankings?.map((r) => ({
          rank: r.rank,
          phone_id: r.phone_id,
          content: r.content,
        })),
        faq: data.faq || [],
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Budget phone updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Budget phone created successfully")
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
    router.push("/budget-phones")
  }

  return {
    form,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleBack,
    handleGenerateSlug,
    thumbnail,
    handleThumbnailPick,
    authorOption,
    handleAuthorPick,
    handleWorkflowImport,
  }
}
