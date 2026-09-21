"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { phoneSchema, PhoneFormValues } from "./phones.dto"
import {
  useCreatePhoneMutation,
  useUpdatePhoneMutation,
  phoneApi,
} from "./phones.api"
import { IMedia } from "../media/media.type"
import { PhoneStatus, PhoneType, BDStatus } from "./phones.constant"
import { SelectOption } from "@/components/common/select/AsyncSelect"
import { slugify } from "@/lib/utils"
import { PhoneFormDraft } from "./ai/ai.types"

const toOptionalNumber = (value?: number) =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined

const sanitizeCameraSystem = (system: PhoneFormValues["front_camera"]) => ({
  ...system,
  cameras: (system?.cameras || []).map((camera) => ({
    ...camera,
    mp: toOptionalNumber(camera.mp),
    zoom: toOptionalNumber(camera.zoom),
  })),
  features: system?.features || [],
  videos: system?.videos || [],
  others: system?.others || [],
})

const sanitizePhonePayload = (data: PhoneFormValues) => {
  const payload = { ...data }
  delete (payload as { types?: unknown }).types
  return {
    ...payload,
    slug: data.slug?.trim() || undefined,
    approximate_price_bd: toOptionalNumber(data.approximate_price_bd),
    expert_rating: toOptionalNumber(data.expert_rating),
    variants: data.variants.map((variant) => ({
      ...variant,
      official_price: toOptionalNumber(variant.official_price),
      unofficial_price: toOptionalNumber(variant.unofficial_price),
    })),
    os: {
      ...data.os,
      others: data.os.others || [],
    },
    platform: {
      ...data.platform,
      others: data.platform.others || [],
    },
    memory: data.memory
      ? {
          ...data.memory,
          others: data.memory.others || [],
        }
      : undefined,
    display: {
      ...data.display,
      refresh_rate: toOptionalNumber(data.display.refresh_rate),
      others: data.display.others || [],
    },
    front_camera: sanitizeCameraSystem(data.front_camera),
    back_camera: sanitizeCameraSystem(data.back_camera),
    battery: {
      ...data.battery,
      capacity: Number(data.battery.capacity) || 0,
      others: data.battery.others || [],
    },
    network: data.network
      ? {
          ...data.network,
          technology: data.network.technology || [],
          others: data.network.others || [],
        }
      : undefined,
    connectivity: data.connectivity
      ? {
          ...data.connectivity,
          others: data.connectivity.others || [],
        }
      : undefined,
    body: data.body
      ? {
          ...data.body,
          weight_g: toOptionalNumber(data.body.weight_g),
          colors: data.body.colors || [],
          certifications: data.body.certifications || [],
          others: data.body.others || [],
        }
      : undefined,
    sound: data.sound
      ? {
          ...data.sound,
          features: data.sound.features || [],
          others: data.sound.others || [],
        }
      : undefined,
    features: data.features
      ? {
          ...data.features,
          sensors: data.features.sensors || [],
          special: data.features.special || [],
          others: data.features.others || [],
        }
      : undefined,
    pros: data.pros || [],
    cons: data.cons || [],
    extras: data.extras || [],
    sources: data.sources || [],
  }
}

const defaultCameraSystem = {
  cameras: [],
  features: [],
  videos: [],
  others: [],
}

const defaultValues: PhoneFormValues = {
  title: "",
  brand: "",
  thumbnail: "",
  images: [],
  categories: [],
  model: "",
  slug: "",
  phone_type: [PhoneType.SMARTPHONE],
  types: [],
  announced: "",
  released: "",
  bd_status: BDStatus.NA,
  approximate_price_bd: 0,
  expert_rating: 0,
  variants: [
    {
      ram: 0,
      storage: 0,
      official_price: 0,
      unofficial_price: 0,
      currency: "BDT",
    },
  ],
  os: { name: "", custom_ui: "", others: [] },
  platform: {
    chipset: "",
    gpu: "",
    cpu: "",
    fabrication: "",
    ram_type: "",
    others: [],
  },
  display: {
    type: "",
    size: "",
    resolution: "",
    protection: "",
    refresh_rate: 0,
    aspect_ratio: "",
    brightness: "",
    bezel: "",
    body_ratio: "",
    others: [],
  },
  memory: {
    card_slot: "",
    internal: "",
    storage_type: "",
    others: [],
  },
  front_camera: defaultCameraSystem,
  back_camera: defaultCameraSystem,
  battery: {
    type: "",
    capacity: 0,
    others: [],
  },
  network: {
    sim_slot: "",
    sim_type: "",
    technology: [],
    speed: "",
    others: [],
  },
  connectivity: {
    wifi: "",
    bluetooth: "",
    positioning: "",
    usb: "",
    radio: false,
    nfc: false,
    others: [],
  },
  body: {
    dimensions: "",
    weight_g: 0,
    build: "",
    colors: [],
    certifications: [],
    others: [],
  },
  sound: {
    loudspeaker: true,
    jack_3_5mm: true,
    features: [],
    others: [],
  },
  features: {
    fingerprint: "",
    sensors: [],
    special: [],
    others: [],
  },
  pros: [],
  cons: [],
  extras: [],
  sources: [],
  status: PhoneStatus.DRAFT,
  schema_version: 1,
}

export const usePhoneForm = (options?: {
  draft?: PhoneFormDraft | null
  onDraftConsumed?: () => void
}) => {
  const { draft, onDraftConsumed } = options || {}
  const [prevItemId, setPrevItemId] = useState<string | null>(null)
  // `undefined` = no override yet (fall back to loaded data);
  // `null` = thumbnail explicitly removed; `IMedia` = thumbnail chosen.
  const [thumbnailOverride, setThumbnailOverride] = useState<
    IMedia | null | undefined
  >(undefined)
  // `undefined` = no override yet; `[]` = gallery explicitly cleared.
  const [imagesOverride, setImagesOverride] = useState<IMedia[] | undefined>(
    undefined
  )
  const [brandOverride, setBrandOverride] = useState<SelectOption | null>(null)
  const [categoriesOverride, setCategoriesOverride] = useState<SelectOption[]>(
    []
  )
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const isEdit = !!itemId

  const [create, createRes] = useCreatePhoneMutation()
  const [update, updateRes] = useUpdatePhoneMutation()
  const [getById, getByIdRes] = phoneApi.useLazyGetPhoneByIdQuery()

  const loadedData = isEdit ? getByIdRes.data?.data : undefined

  const brand = useMemo(() => {
    if (brandOverride) return brandOverride
    if (loadedData?.brand) {
      return {
        label: loadedData.brand.name,
        value: loadedData.brand._id || "",
      } as SelectOption
    }
    return null
  }, [brandOverride, loadedData])

  const categories = useMemo(() => {
    if (categoriesOverride.length > 0) return categoriesOverride
    if (loadedData?.categories) {
      return loadedData.categories.map((c) => ({
        label: c.name,
        value: c._id || "",
      })) as SelectOption[]
    }
    return []
  }, [categoriesOverride, loadedData])

  const thumbnail = useMemo(() => {
    if (thumbnailOverride === undefined)
      return (loadedData?.thumbnail as IMedia) ?? null
    return thumbnailOverride
  }, [thumbnailOverride, loadedData])

  const images = useMemo(() => {
    if (imagesOverride === undefined)
      return (loadedData?.images as IMedia[]) ?? []
    return imagesOverride
  }, [imagesOverride, loadedData])

  if (itemId !== prevItemId) {
    setPrevItemId(itemId)
    setBrandOverride(null)
    setCategoriesOverride([])
    setThumbnailOverride(undefined)
    setImagesOverride(undefined)
  }

  const schema = useMemo(() => phoneSchema(isEdit), [isEdit])

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  const {
    fields: frontCameraFields,
    append: appendFrontCamera,
    remove: removeFrontCamera,
  } = useFieldArray({
    control: form.control,
    name: "front_camera.cameras",
  })

  const {
    fields: backCameraFields,
    append: appendBackCamera,
    remove: removeBackCamera,
  } = useFieldArray({
    control: form.control,
    name: "back_camera.cameras",
  })

  const {
    fields: sourceFields,
    append: appendSource,
    remove: removeSource,
  } = useFieldArray({
    control: form.control,
    name: "sources",
  })

  const {
    fields: extraFields,
    append: appendExtra,
    remove: removeExtra,
  } = useFieldArray({
    control: form.control,
    name: "extras",
  })

  const handleGenerateSlug = () => {
    if (brand) {
      const brandName = brand.label.replace(/\s+/g, "-").toLowerCase()
      const modal = form.getValues("model").replace(/\s+/g, "-").toLowerCase()
      const slug = slugify(`${brandName}-${modal}`)
      form.setValue("slug", slug, { shouldValidate: true })
    } else {
      toast.error("Please select a brand and model first")
    }
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
        ...data,
        brand: data.brand?._id || "",
        thumbnail: data.thumbnail?._id || "",
        images: data.images?.map((img) => img._id) || [],
        categories: data.categories?.map((category) => category._id) || [],
        announced: data.announced
          ? new Date(data.announced).toISOString().split("T")[0]
          : "",
        released: data.released
          ? new Date(data.released).toISOString().split("T")[0]
          : "",
        os: {
          ...defaultValues.os,
          ...data.os,
          others: data.os?.others || [],
        },
        platform: {
          ...defaultValues.platform,
          ...data.platform,
          others: data.platform?.others || [],
        },
        memory: data.memory
          ? {
              ...defaultValues.memory,
              ...data.memory,
              others: data.memory?.others || [],
            }
          : undefined,
        display: {
          ...defaultValues.display,
          ...data.display,
          others: data.display?.others || [],
        },
        front_camera: {
          ...defaultValues.front_camera,
          ...data.front_camera,
          cameras: data.front_camera?.cameras || [],
          others: data.front_camera?.others || [],
        },
        back_camera: {
          ...defaultValues.back_camera,
          ...data.back_camera,
          cameras: data.back_camera?.cameras || [],
          others: data.back_camera?.others || [],
        },
        battery: {
          ...defaultValues.battery,
          ...data.battery,
          others: data.battery?.others || [],
        },
        network: data.network
          ? {
              ...defaultValues.network,
              ...data.network,
              others: data.network.others || [],
            }
          : undefined,
        connectivity: data.connectivity
          ? {
              ...defaultValues.connectivity,
              ...data.connectivity,
              others: data.connectivity?.others || [],
            }
          : undefined,
        body: data.body
          ? {
              ...defaultValues.body,
              ...data.body,
              colors: data.body?.colors || [],
              certifications: data.body?.certifications || [],
              others: data.body?.others || [],
            }
          : undefined,
        sound: data.sound
          ? {
              ...defaultValues.sound,
              ...data.sound,
              others: data.sound?.others || [],
            }
          : undefined,
        features: data.features
          ? {
              ...defaultValues.features,
              ...data.features,
              others: data.features?.others || [],
            }
          : undefined,
        variants: (data.variants || []).map((v) => ({
          ram: v.ram,
          storage: v.storage,
          official_price: v.official_price,
          unofficial_price: v.unofficial_price,
          currency: v.currency,
        })),
        types: data.types || [],
        extras: (data.extras || []).map((e) => ({
          group_key: e.group_key,
          label: e.label,
          value: e.value,
          order: e.order,
        })),
      } as PhoneFormValues)
    }
  }, [getByIdRes.data, isEdit, form])

  useEffect(() => {
    if (draft && !isEdit) {
      setBrandOverride(draft.brand || null)
      setCategoriesOverride([])
      setThumbnailOverride(undefined)
      setImagesOverride(undefined)
      form.reset({ ...defaultValues, ...draft.values })
      onDraftConsumed?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isEdit])

  const onSubmit = async (data: PhoneFormValues) => {
    try {
      const payload = sanitizePhonePayload({
        ...data,
        brand: brand?.value || data.brand,
        categories:
          categories.length > 0
            ? categories.map((category) => category.value)
            : data.categories,
        thumbnail: thumbnail?._id ?? undefined,
        images: images.map((image) => image._id),
      })

      if (isEdit && itemId) {
        await update({ id: itemId, body: payload }).unwrap()
        toast.success("Phone updated successfully")
      } else {
        await create(payload).unwrap()
        toast.success("Phone created successfully")
      }
      router.push("/phones")
    } catch (error: unknown) {
      const err = error as { data?: { message?: string; error?: string } }
      toast.error(
        err?.data?.message || err?.data?.error || "Something went wrong"
      )
    }
  }

  const handleCancel = () => {
    router.push("/phones")
  }

  return {
    form,
    thumbnail,
    setThumbnail: setThumbnailOverride,
    images,
    setImages: setImagesOverride,
    brand,
    setBrand: setBrandOverride,
    categories,
    setCategories: setCategoriesOverride,
    variantFields,
    appendVariant,
    removeVariant,
    frontCameraFields,
    appendFrontCamera,
    removeFrontCamera,
    backCameraFields,
    appendBackCamera,
    removeBackCamera,
    sourceFields,
    appendSource,
    removeSource,
    extraFields,
    appendExtra,
    removeExtra,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleCancel,
    handleGenerateSlug,
  }
}
