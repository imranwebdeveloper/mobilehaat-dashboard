"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import {
  sellerInfoSchema,
  SellerInfoFormValues,
  SellerSubmitValues,
} from "./seller.dto"
import {
  SellerBusinessType,
  SellerStatus,
  SellerVerificationStatus,
} from "./seller.type"
import { sellerApi } from "./seller.api"
import type { IMedia } from "../media/media.type"

const toCoordNumber = (v?: string): number | undefined => {
  if (v === undefined || v.trim() === "") return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

const toMediaFormValue = (media?: IMedia | string | null): string => {
  if (!media) return ""
  return typeof media === "string" ? media : media._id || ""
}

const toMediaUrl = (media?: IMedia | string | null): string => {
  if (!media) return ""
  if (typeof media === "string") return ""
  return media.url || ""
}

const buildPayload = (data: SellerInfoFormValues): SellerSubmitValues => ({
  ...data,
  address: {
    ...data.address,
    latitude: toCoordNumber(data.address.latitude),
    longitude: toCoordNumber(data.address.longitude),
  },
})

const defaultValues: SellerInfoFormValues = {
  store_name: "",
  owner_name: "",
  description: "",
  phone: "",
  email: "",
  alternate_phone: "",
  business_type: SellerBusinessType.INDIVIDUAL,
  user_id: "",
  status: SellerStatus.ACTIVE,
  verification_status: SellerVerificationStatus.UNVERIFIED,
  address: {
    address_line: "",
    landmark: "",
    division_id: "",
    district_id: "",
    upazila_id: "",
    latitude: "",
    longitude: "",
  },
  social: {
    website: "",
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
  },
  branding: {
    logo: "",
    cover_image: "",
  },
  settings: {
    is_store_active: true,
    show_phone: true,
    show_email: false,
    show_whatsapp: true,
    show_address: true,
    show_location: true,
    show_website: true,
    show_facebook: true,
    show_instagram: true,
    show_youtube: true,
    show_out_of_stock: true,
    email_notifications: true,
    subscription_notifications: true,
    offer_notifications: true,
  },
}

type ApiError = {
  data?: {
    message?: string
    error?: string
  }
}

export const useSellerForm = () => {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const isEdit = !!itemId

  const [create, createRes] = sellerApi.useCreateSellerMutation()
  const [update, updateRes] = sellerApi.useUpdateSellerMutation()
  const [getById, getByIdRes] = sellerApi.useLazyGetSellerByIdQuery()

  const [logoMedia, setLogoMedia] = useState<string>("")
  const [coverMedia, setCoverMedia] = useState<string>("")

  const schema = useMemo(() => sellerInfoSchema(isEdit), [isEdit])

  const form = useForm<SellerInfoFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (isEdit && itemId) {
      getById(itemId)
        .unwrap()
        .then((response) => {
          const data = response.data

          form.reset({
            store_name: data.store_name,
            owner_name: data.owner_name,
            description: data.description || "",
            phone: data.phone,
            email: data.email,
            alternate_phone: data.alternate_phone || "",
            business_type: data.business_type
              ? ((
                  data.business_type as string
                ).toUpperCase() as SellerBusinessType)
              : SellerBusinessType.INDIVIDUAL,
            user_id: "",
            status: (data.status as SellerStatus) || SellerStatus.ACTIVE,
            verification_status:
              (data.verification?.status as SellerVerificationStatus) ||
              SellerVerificationStatus.UNVERIFIED,
            address: {
              address_line: data.address?.address_line || "",
              landmark: data.address?.landmark || "",
              division_id: data.address?.division_id || "",
              district_id: data.address?.district_id || "",
              upazila_id: data.address?.upazila_id || "",
              latitude:
                data.address?.latitude != null
                  ? String(data.address.latitude)
                  : "",
              longitude:
                data.address?.longitude != null
                  ? String(data.address.longitude)
                  : "",
            },
            social: {
              website: data.social?.website || "",
              facebook: data.social?.facebook || "",
              instagram: data.social?.instagram || "",
              youtube: data.social?.youtube || "",
              whatsapp: data.social?.whatsapp || "",
            },
            branding: {
              logo: toMediaFormValue(data.branding?.logo),
              cover_image: toMediaFormValue(data.branding?.cover_image),
            },
            settings: {
              is_store_active: data.settings?.is_store_active ?? true,
              show_phone: data.settings?.show_phone ?? true,
              show_email: data.settings?.show_email ?? false,
              show_whatsapp: data.settings?.show_whatsapp ?? true,
              show_address: data.settings?.show_address ?? true,
              show_location: data.settings?.show_location ?? true,
              show_website: data.settings?.show_website ?? true,
              show_facebook: data.settings?.show_facebook ?? true,
              show_instagram: data.settings?.show_instagram ?? true,
              show_youtube: data.settings?.show_youtube ?? true,
              show_out_of_stock: data.settings?.show_out_of_stock ?? true,
              email_notifications:
                data.settings?.email_notifications ?? true,
              subscription_notifications:
                data.settings?.subscription_notifications ?? true,
              offer_notifications:
                data.settings?.offer_notifications ?? true,
            },
          })

          const rawLogo = data.branding?.logo
          const rawCover = data.branding?.cover_image
          setLogoMedia(toMediaUrl(rawLogo))
          setCoverMedia(toMediaUrl(rawCover))
        })
    }
  }, [isEdit, itemId, getById, form])

  const onSubmit = async (data: SellerInfoFormValues) => {
    try {
      if (isEdit && itemId) {
        const {
          user_id: _user_id,
          status: _status,
          verification_status: _verification_status,
          ...body
        } = buildPayload(data)
        void _user_id
        void _status
        void _verification_status
        await update({ id: itemId, body }).unwrap()
        toast.success("Seller updated successfully")
      } else {
        await create(buildPayload(data)).unwrap()
        toast.success("Seller created successfully")
      }
      router.push("/sellers")
    } catch (error: unknown) {
      const err = error as ApiError
      toast.error(
        err.data?.message || err.data?.error || "Something went wrong"
      )
    }
  }

  const handleCancel = () => {
    router.push("/sellers")
  }

  return {
    form,
    onSubmit,
    isLoading: createRes.isLoading || updateRes.isLoading,
    isFetching: getByIdRes.isFetching,
    isEdit,
    handleCancel,
    logoMedia,
    setLogoMedia,
    coverMedia,
    setCoverMedia,
  }
}
