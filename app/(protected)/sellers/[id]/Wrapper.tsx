"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BellIcon,
  Building2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  FacebookIcon,
  FileIcon,
  GlobeIcon,
  ImageIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PencilIcon,
  PhoneIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  Store,
  UserRoundIcon,
  XCircleIcon,
  YoutubeIcon,
  CreditCardIcon,
  PackageIcon,
  DollarSignIcon,
} from "lucide-react"

import { useGetSellerByIdQuery, useGetSellerSubscriptionsQuery, useGetSellerOffersQuery, useGetSellerPaymentsQuery } from "../seller.api"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/common/StatusBadge"
import Permission from "@/components/common/Permission"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import Modal from "../Modal"
import { useModalContext } from "@/hooks/useModalContext"
import { AttachmentGrid } from "@/hooks/useMediaByIds"
import {
  SellerBusinessType,
  SellerVerificationStatus,
  ISeller,
} from "../seller.type"
import { ISellerSubscription } from "../../seller-subscriptions/seller-subscription.type"
import { ISellerOffer } from "../../seller-offers/seller-offer.type"
import { IPaymentRecord } from "../../payment-records/payment-record.type"
import { SELLER_BUSINESS_TYPE_OPTIONS } from "../seller.constant"
import { useGeoMaps } from "../useGeoMaps"

/* ------------------------------ helpers ------------------------------ */

const businessTypeLabel = (type?: SellerBusinessType) => {
  if (!type) return "N/A"
  const found = SELLER_BUSINESS_TYPE_OPTIONS.find((o) => o.value === type)
  return found?.label || type.toLowerCase().replace(/_/g, " ")
}

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : null

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : null

const normalizeHref = (value?: string) => {
  if (!value) return undefined
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

const brandingUrl = (media?: ISeller["branding"]["logo"]) => {
  if (!media) return undefined
  return typeof media === "string"
    ? normalizeHref(media)
    : normalizeHref(media?.url)
}

const waHref = (value?: string) => {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  return `https://wa.me/${value.replace(/[^0-9+]/g, "")}`
}

/* ------------------------- small building blocks ------------------------- */

const DetailRow = ({
  icon: Icon,
  label,
  value,
  href,
  badge,
}: {
  icon?: LucideIcon
  label: string
  value?: string | null
  href?: string
  badge?: React.ReactNode
}) => (
  <div className="flex items-start justify-between gap-3 border-b border-muted pb-3 last:border-0 last:pb-0">
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
        <span className="text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
      </div>
      {href && value ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium break-all text-primary hover:underline"
        >
          {value}
        </Link>
      ) : (
        <span className="text-sm font-medium break-all">{value || "N/A"}</span>
      )}
    </div>
    {badge ? <div className="shrink-0">{badge}</div> : null}
  </div>
)

const SocialLink = ({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon
  label: string
  href: string
}) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 rounded-lg border border-muted bg-muted/30 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-muted/60 hover:text-primary"
  >
    <Icon className="h-4 w-4 shrink-0 text-primary" />
    <span className="min-w-0 flex-1 truncate">{label}</span>
    <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
  </Link>
)

const SettingToggle = ({
  label,
  enabled,
}: {
  label: string
  enabled: boolean
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-muted pb-3 last:border-0 last:pb-0">
    <span className="text-sm text-foreground">{label}</span>
    {enabled ? (
      <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-600" />
    ) : (
      <XCircleIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
    )}
  </div>
)

/* --------------------------- attachments --------------------------- */

/* ------------------------------- content ------------------------------- */

const DetailContent = () => {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const { data, isLoading } = useGetSellerByIdQuery(itemId)
  const { data: subscriptionsData } = useGetSellerSubscriptionsQuery(itemId)
  const { data: offersData } = useGetSellerOffersQuery({ sellerId: itemId })
  const { data: paymentsData } = useGetSellerPaymentsQuery(itemId)
  const { setAction } = useModalContext()
  const { getDivisionName, getDistrictName, getUpazilaName } = useGeoMaps()

  if (isLoading) {
    return <div className="p-8 text-center">Loading seller details...</div>
  }

  if (!data?.data) {
    return (
      <div className="p-8 text-center text-destructive">Seller not found</div>
    )
  }

  const seller = data.data

  const openAction = (action: "status" | "verify") => {
    setAction({
      action,
      itemId: seller._id,
      extraState: {
        name: seller.store_name,
        currentStatus:
          action === "verify"
            ? seller.verification?.status
            : seller.status,
        reason: seller.verification?.reason,
        attachments: seller.verification?.attachments,
      },
    })
  }

  const logo = brandingUrl(seller.branding?.logo)
  const cover = brandingUrl(seller.branding?.cover_image)

  const divisionName = getDivisionName(seller.address?.division_id)
  const districtName = getDistrictName(seller.address?.district_id)
  const upazilaName = getUpazilaName(seller.address?.upazila_id)
  const addressParts = [
    seller.address?.upazila_id ? upazilaName : null,
    seller.address?.district_id ? districtName : null,
    seller.address?.division_id ? divisionName : null,
  ].filter((part): part is string => Boolean(part))
  const hasCoordinates =
    seller.address?.latitude != null && seller.address?.longitude != null
  const mapHref = hasCoordinates
    ? `https://www.google.com/maps?q=${seller.address?.latitude},${seller.address?.longitude}`
    : seller.address?.address_line
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          seller.address.address_line
        )}`
      : undefined

  const socialLinks = [
    {
      icon: GlobeIcon,
      label: "Website",
      href: normalizeHref(seller.social?.website),
    },
    {
      icon: FacebookIcon,
      label: "Facebook",
      href: normalizeHref(seller.social?.facebook),
    },
    {
      icon: InstagramIcon,
      label: "Instagram",
      href: normalizeHref(seller.social?.instagram),
    },
    {
      icon: YoutubeIcon,
      label: "YouTube",
      href: normalizeHref(seller.social?.youtube),
    },
    {
      icon: MessageCircleIcon,
      label: "WhatsApp",
      href: waHref(seller.social?.whatsapp),
    },
  ].filter((link): link is { icon: LucideIcon; label: string; href: string } =>
    Boolean(link.href)
  )

  const hasRejectReason =
    seller.verification?.reason &&
    (seller.verification?.status === SellerVerificationStatus.REJECTED ||
      seller.verification?.status === SellerVerificationStatus.SUSPENDED)

  const hasAttachments =
    seller.verification?.attachments && seller.verification.attachments.length > 0

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/sellers")}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <div className="flex flex-wrap gap-2">
          <Permission permission={Permissions.SELLER_UPDATE}>
            <Link href={`/sellers/${seller._id}/edit`}>
              <Button size="sm">
                <PencilIcon className="mr-2 h-4 w-4" /> Edit Info
              </Button>
            </Link>
          </Permission>

          <Permission permission={Permissions.SELLER_MODERATE}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAction("status")}
            >
              Change Status
            </Button>
          </Permission>

          <Permission permission={Permissions.SELLER_MODERATE}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAction("verify")}
            >
              Manage Verification
            </Button>
          </Permission>
        </div>
      </div>

      {/* Store hero */}
      <Card className="overflow-hidden">
        {cover ? (
          <div className="relative h-28 w-full bg-muted sm:h-36">
            <Image
              src={cover}
              alt={`${seller.store_name} cover`}
              fill
              priority
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent sm:h-24" />
        )}

        <div className="flex flex-col gap-5 px-6 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="-mt-10 overflow-hidden rounded-2xl border-4 border-background bg-background shadow-sm">
                {logo ? (
                  <Image
                    src={logo}
                    alt={`${seller.store_name} logo`}
                    width={96}
                    height={96}
                    className="h-20 w-20 object-contain p-1 sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center bg-primary text-primary-foreground sm:h-24 sm:w-24">
                    <Store className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {seller.store_name}
                </h1>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  slug / {seller.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground md:text-right">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>
                Registered{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(seller.createdAt)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={seller.status} />
            <StatusBadge status={seller.verification?.status} />
            <Badge variant="secondary" className="font-bold">
              {businessTypeLabel(seller.business_type)}
            </Badge>
          </div>

          {/* Rejection / Suspension reason */}
          {hasRejectReason ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="mb-1 text-xs font-semibold tracking-wider text-destructive uppercase">
                {seller.verification.status === SellerVerificationStatus.REJECTED
                  ? "Rejection Reason"
                  : "Suspension Reason"}
              </p>
              <p className="text-sm text-foreground">
                {seller.verification.reason}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-muted pt-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <UserRoundIcon className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {seller.owner_name || "N/A"}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <PhoneIcon className="h-4 w-4" />
              <a
                href={`tel:${seller.phone}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {seller.phone || "N/A"}
              </a>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MailIcon className="h-4 w-4" />
              <a
                href={`mailto:${seller.email}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {seller.email || "N/A"}
              </a>
            </span>
          </div>

          {seller.description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {seller.description}
            </p>
          ) : null}
        </div>
      </Card>

      {/* Verification attachments (full width) */}
      {hasAttachments ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <FileIcon className="h-4 w-4" /> Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentGrid ids={seller.verification.attachments} />
          </CardContent>
        </Card>
      ) : null}

      {/* Subscription / Offer / Payment Summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Subscription Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" /> Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {subscriptionsData?.data && subscriptionsData.data.length > 0 ? (
              <>
                {subscriptionsData.data.map((sub) => (
                  <div key={sub._id} className="space-y-1">
                    <DetailRow
                      icon={PackageIcon}
                      label="Plan"
                      value={sub.plan_name}
                    />
                    <DetailRow
                      label="Status"
                      value={sub.status}
                      badge={<StatusBadge status={sub.status} />}
                    />
                    <DetailRow
                      label="Max Active Offers"
                      value={sub.max_active_offers?.toString() || "0"}
                    />
                    <DetailRow
                      label="Period"
                      value={
                        sub.start_at
                          ? `${formatDate(sub.start_at)} - ${sub.end_at ? formatDate(sub.end_at) : "No expiry"}`
                          : "N/A"
                      }
                    />
                    <DetailRow
                      label="Price"
                      value={
                        sub.price
                          ? `${sub.price} ${sub.currency}`
                          : "Free"
                      }
                    />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No subscriptions found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Offer Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <PackageIcon className="h-4 w-4" /> Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {offersData?.data && offersData.data.length > 0 ? (
              <>
                <div className="space-y-1">
                  <DetailRow
                    label="Total Offers"
                    value={offersData.data.length.toString()}
                  />
                  <DetailRow
                    label="Active"
                    value={
                      offersData.data.filter((o) => o.status === "ACTIVE").length
                        .toString()
                    }
                  />
                  <DetailRow
                    label="Paused"
                    value={
                      offersData.data.filter((o) => o.status === "PAUSED").length
                        .toString()
                    }
                  />
                  <DetailRow
                    label="Expired"
                    value={
                      offersData.data.filter((o) => o.status === "EXPIRED").length
                        .toString()
                    }
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No offers found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4" /> Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paymentsData?.data && paymentsData.data.length > 0 ? (
              <>
                <div className="space-y-1">
                  <DetailRow
                    label="Total Payments"
                    value={paymentsData.data.length.toString()}
                  />
                  <DetailRow
                    label="Verified"
                    value={
                      paymentsData.data.filter((p) => p.status === "VERIFIED").length
                        .toString()
                    }
                  />
                  <DetailRow
                    label="Pending"
                    value={
                      paymentsData.data.filter((p) =>
                        ["PENDING", "SUBMITTED"].includes(p.status),
                      ).length.toString()
                    }
                  />
                  <DetailRow
                    label="Rejected"
                    value={
                      paymentsData.data.filter((p) => p.status === "REJECTED").length
                        .toString()
                    }
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payments found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid content-start gap-6 md:grid-cols-2 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Building2Icon className="h-4 w-4" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={Store}
                label="Store Name"
                value={seller.store_name}
              />
              <DetailRow
                icon={UserRoundIcon}
                label="Owner Name"
                value={seller.owner_name}
              />
              <DetailRow
                icon={Building2Icon}
                label="Business Type"
                value={businessTypeLabel(seller.business_type)}
              />
              <DetailRow
                icon={ShieldCheckIcon}
                label="User ID"
                value={seller.user_id}
                href={`/users/${seller.user_id}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <MailIcon className="h-4 w-4" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={MailIcon}
                label="Email"
                value={seller.email}
                href={seller.email ? `mailto:${seller.email}` : undefined}
              />
              <DetailRow
                icon={PhoneIcon}
                label="Phone"
                value={seller.phone}
                href={seller.phone ? `tel:${seller.phone}` : undefined}
              />
              <DetailRow
                icon={PhoneIcon}
                label="Alternate Phone"
                value={seller.alternate_phone}
                href={
                  seller.alternate_phone
                    ? `tel:${seller.alternate_phone}`
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4" /> Account & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-muted pb-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Status
                </span>
                <StatusBadge status={seller.status} />
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-muted pb-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Verification
                </span>
                <StatusBadge status={seller.verification?.status} />
              </div>
              <DetailRow
                label="Verified At"
                value={formatDateTime(seller.verification?.verified_at)}
              />
              <DetailRow
                label="Verified By"
                value={seller.verification?.verified_by}
              />
              <DetailRow
                label="Created At"
                value={formatDateTime(seller.createdAt)}
              />
              <DetailRow
                label="Updated At"
                value={formatDateTime(seller.updatedAt)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" /> Address & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label="Address Line"
                value={seller.address?.address_line}
              />
              <DetailRow label="Landmark" value={seller.address?.landmark} />
              <DetailRow
                label="Area / Region"
                value={addressParts.join(", ")}
              />
              <DetailRow
                label="Coordinates"
                value={
                  hasCoordinates
                    ? `${seller.address?.latitude}, ${seller.address?.longitude}`
                    : null
                }
                badge={
                  hasCoordinates ? (
                    <Badge variant="outline" className="bg-background">
                      GPS
                    </Badge>
                  ) : undefined
                }
              />
              {mapHref ? (
                <Link href={mapHref} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <NavigationIcon className="mr-2 h-4 w-4" /> Open in Google
                    Maps
                  </Button>
                </Link>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <GlobeIcon className="h-4 w-4" /> Social & Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialLinks.length ? (
                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <SocialLink
                      key={link.label}
                      icon={link.icon}
                      label={link.label}
                      href={link.href}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No social links added.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" /> Store Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <SettingToggle
                label="Store Active"
                enabled={seller.settings?.is_store_active ?? true}
              />
              <SettingToggle
                label="Show Phone"
                enabled={seller.settings?.show_phone ?? true}
              />
              <SettingToggle
                label="Show Email"
                enabled={seller.settings?.show_email ?? false}
              />
              <SettingToggle
                label="Show WhatsApp"
                enabled={seller.settings?.show_whatsapp ?? true}
              />
              <SettingToggle
                label="Show Address"
                enabled={seller.settings?.show_address ?? true}
              />
              <SettingToggle
                label="Show Location"
                enabled={seller.settings?.show_location ?? true}
              />
              <SettingToggle
                label="Show Website"
                enabled={seller.settings?.show_website ?? true}
              />
              <SettingToggle
                label="Show Facebook"
                enabled={seller.settings?.show_facebook ?? true}
              />
              <SettingToggle
                label="Show Instagram"
                enabled={seller.settings?.show_instagram ?? true}
              />
              <SettingToggle
                label="Show YouTube"
                enabled={seller.settings?.show_youtube ?? true}
              />
              <SettingToggle
                label="Show Out of Stock"
                enabled={seller.settings?.show_out_of_stock ?? true}
              />
              <SettingToggle
                label="Email Notifications"
                enabled={seller.settings?.email_notifications ?? true}
              />
              <SettingToggle
                label="Subscription Notifications"
                enabled={seller.settings?.subscription_notifications ?? true}
              />
              <SettingToggle
                label="Offer Notifications"
                enabled={seller.settings?.offer_notifications ?? true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const Wrapper = () => {
  return (
    <QueryAndModalWrapper>
      <DetailContent />
      <Modal />
    </QueryAndModalWrapper>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.SELLER_READ],
})
