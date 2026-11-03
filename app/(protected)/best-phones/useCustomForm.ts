/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { bestPhoneSchema, BestPhoneFormValues } from "./best-phones.dto"
import { bestPhoneApi } from "./best-phones.api"
import {
  BestPhoneBadge,
  BestPhoneChangeType,
  BestPhoneStatus,
  BestPhoneTier,
} from "./best-phones.type"
import { IMedia } from "../media/media.type"
import { slugify } from "@/lib/utils"
import { SelectOption } from "@/components/common/select/AsyncSelect"
import { phoneApi } from "../phones/phones.api"
import { globalApi } from "@/store/global.api"
import type {
  WorkflowChangeItem,
  WorkflowImport,
  WorkflowRanking,
} from "./workflowImport"

const defaultValues: BestPhoneFormValues = {
  title: "",
  slug: "",
  intro: "",
  disclaimer: "",
  author: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  thumbnail: null,
  min_price: 0,
  max_price: 0,
  tolerance_pct: 5,
  last_reviewed_at: "",
  status: BestPhoneStatus.INACTIVE,
  rankings: [],
  changes: [],
  faq: [],
}

type ApiError = {
  data?: {
    message?: string | string[]
    error?: string
  }
}

// "2026-11-03T00:00:00.000Z" → "2026-11-03" for the date input.
const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : "")

const cleanLines = (items?: string[]) =>
  (items || []).map((s) => s.trim()).filter(Boolean)

const pickEnum = <T extends string>(values: T[], value?: string | null) =>
  values.find((v) => v === value)

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

  const [create, createRes] = bestPhoneApi.useCreateBestPhoneMutation()
  const [update, updateRes] = bestPhoneApi.useUpdateBestPhoneMutation()
  const [getById, getByIdRes] = bestPhoneApi.useLazyGetBestPhoneByIdQuery()
  const [getPhoneById] = phoneApi.useLazyGetPhoneByIdQuery()
  const [getData] = globalApi.useLazyGetDataQuery()

  const schema = useMemo(() => bestPhoneSchema(), [])

  const form = useForm<BestPhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // Generate turns whatever is typed (e.g. "Under 30000") into a clean
  // slug ("under-30000").
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
        tier: r.tier || BestPhoneTier.FULL,
        badges: r.badges || [],
        chips: r.chips || [],
        for_whom: r.for_whom || "",
        pros: r.pros || [],
        cons: r.cons || [],
        content: r.content || "",
        editor_note: r.editor_note || "",
        label: r.phone?.title,
      }))
      const changes = data.changes?.map((c) => ({
        month: c.month,
        items: c.items.map((item) => ({
          type: item.type,
          phone_id: item.phone?._id || "",
          label: item.phone?.title || "",
          text: item.text,
        })),
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
        author: authorId,
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        meta_keywords: data.meta_keywords || "",
        thumbnail: (data.thumbnail as any)?._id || data.thumbnail || null,
        min_price: data.min_price,
        max_price: data.max_price,
        tolerance_pct: data.tolerance_pct ?? 5,
        last_reviewed_at: toDateInput(data.last_reviewed_at),
        status: data.status,
        rankings: rankings || [],
        changes: changes || [],
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
  const fetchedAuthor = getByIdRes.data?.data.author
  let authorOption: SelectOption | null = null
  if (authorPick && authorPick.key === itemId) {
    authorOption = authorPick.option
  } else if (
    fetchedAuthor &&
    typeof fetchedAuthor === "object" &&
    fetchedAuthor._id
  ) {
    authorOption = {
      label: fetchedAuthor.name || "Author",
      value: fetchedAuthor._id,
    }
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
    r: Pick<WorkflowRanking | WorkflowChangeItem, "phone_db_id" | "phone_slug">
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

  // Fills the whole form from the workflow's cards.json. Thumbnail is left
  // alone; nothing is saved. Returns warnings for anything that could not be
  // resolved, so the form can show them to the editor.
  const handleWorkflowImport = async ({ page, rankings }: WorkflowImport) => {
    const warnings: string[] = []
    const current = form.getValues()
    const badgeValues = Object.values(BestPhoneBadge)

    const phones = await Promise.all(rankings.map(resolvePhone))
    const importedRankings = rankings.map((r, i) => {
      const phone = phones[i]
      const rank = Number(r.rank) || i + 1
      if (!phone) {
        warnings.push(
          `#${rank} ${r.phone_title || r.phone_slug || "Phone"}: not found in the phone DB. Pick the phone manually (its card was imported).`
        )
      }
      const unknownBadges = (r.badges || []).filter(
        (b) => !badgeValues.includes(b as BestPhoneBadge)
      )
      if (unknownBadges.length) {
        warnings.push(
          `#${rank}: unknown badge(s) ${unknownBadges.join(", ")} skipped.`
        )
      }
      return {
        rank,
        phone_id: phone?.value || "",
        tier:
          pickEnum(Object.values(BestPhoneTier), r.tier) || BestPhoneTier.FULL,
        badges: (r.badges || []).filter((b): b is BestPhoneBadge =>
          badgeValues.includes(b as BestPhoneBadge)
        ),
        chips: r.chips || [],
        for_whom: r.for_whom || "",
        pros: r.pros || [],
        cons: r.cons || [],
        content: r.content_html || "",
        editor_note: r.editor_note || "",
        label: phone?.label || "",
      }
    })

    const changes = await Promise.all(
      (page.changes || []).map(async (c) => ({
        month: c.month,
        items: await Promise.all(
          c.items.map(async (item) => {
            const phone =
              item.phone_db_id || item.phone_slug
                ? await resolvePhone(item)
                : null
            if ((item.phone_db_id || item.phone_slug) && !phone) {
              warnings.push(
                `Change (${c.month}) "${item.text}": phone ${item.phone_slug || item.phone_db_id} not found; saved without a phone link.`
              )
            }
            return {
              type:
                pickEnum(Object.values(BestPhoneChangeType), item.type) ||
                BestPhoneChangeType.NEW,
              phone_id: phone?.value || "",
              label: phone?.label || "",
              text: item.text,
            }
          })
        ),
      }))
    )

    let author = current.author
    let authorOption: SelectOption | null = null
    if (page.author) {
      const found = await findBySlug("/authors", page.author)
      if (found?._id) {
        author = found._id
        authorOption = { label: found.name || page.author, value: found._id }
      } else {
        warnings.push(
          `Author "${page.author}" not found. The author was left unchanged.`
        )
      }
    }

    form.reset(
      {
        ...current,
        title: page.title,
        slug: page.slug || current.slug,
        intro: page.intro || "",
        disclaimer: page.disclaimer_html || "",
        author,
        meta_title: page.meta_title || "",
        meta_description: page.meta_description || "",
        meta_keywords: page.meta_keywords || "",
        min_price: page.min_price ?? current.min_price,
        max_price: page.max_price ?? current.max_price,
        tolerance_pct: page.tolerance_pct ?? current.tolerance_pct,
        last_reviewed_at:
          toDateInput(page.last_reviewed_at) || current.last_reviewed_at,
        status:
          pickEnum(Object.values(BestPhoneStatus), page.status) ||
          current.status,
        rankings: importedRankings,
        changes,
        faq: (page.faq || []).map((f) => ({
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

  const onSubmit = async (data: BestPhoneFormValues) => {
    try {
      const payload = {
        ...data,
        thumbnail: thumbnail?._id || data.thumbnail,
        min_price: Number(data.min_price),
        max_price: Number(data.max_price),
        tolerance_pct: Number(data.tolerance_pct),
        last_reviewed_at: data.last_reviewed_at || undefined,
        rankings: data.rankings?.map((r) => ({
          rank: r.rank,
          phone_id: r.phone_id,
          tier: r.tier,
          badges: r.badges,
          chips: cleanLines(r.chips),
          for_whom: r.for_whom,
          pros: cleanLines(r.pros),
          cons: cleanLines(r.cons),
          content:
            r.tier === BestPhoneTier.FULL || r.content?.trim()
              ? r.content
              : undefined,
          editor_note: r.editor_note?.trim() || undefined,
        })),
        changes: data.changes?.map((c) => ({
          month: c.month,
          items: c.items.map((item) => ({
            type: item.type,
            ...(item.phone_id && { phone_id: item.phone_id }),
            text: item.text,
          })),
        })),
        faq: data.faq || [],
      }

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Best phone page updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Best phone page created successfully")
      }

      handleBack()
    } catch (error: unknown) {
      const err = error as ApiError
      const message = err.data?.message
      toast.error(
        (Array.isArray(message) ? message.join(", ") : message) ||
          err.data?.error ||
          "Something went wrong"
      )
    }
  }

  const handleBack = () => {
    router.push("/best-phones")
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
