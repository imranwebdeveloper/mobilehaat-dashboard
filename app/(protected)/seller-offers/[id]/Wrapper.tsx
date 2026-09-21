"use client"

import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  PackageIcon,
  PhoneIcon,
  Store,
  TagIcon,
  WalletIcon,
} from "lucide-react"

import { useGetSellerOfferByIdQuery } from "../seller-offer.api"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StatusBadge from "@/components/common/StatusBadge"
import DetailRow from "@/components/common/DetailRow"
import Permission from "@/components/common/Permission"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import Modal from "../Modal"
import { useModalContext } from "@/hooks/useModalContext"
import { SellerOfferStatus } from "../seller-offer.type"
import { formatBDT, formatDateTime } from "@/lib/utils"

/* ------------------------------- content ------------------------------- */

const DetailContent = () => {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const { data, isLoading } = useGetSellerOfferByIdQuery(itemId)
  const { setAction } = useModalContext()

  if (isLoading) {
    return <div className="p-8 text-center">Loading offer details...</div>
  }

  if (!data?.data) {
    return (
      <div className="p-8 text-center text-destructive">Offer not found</div>
    )
  }

  const offer = data.data
  const seller = offer.seller_id
  const phone = offer.phone_id
  const variant = offer.variant_id

  const openAction = (action: "activate" | "pause" | "delete") => {
    setAction({
      action,
      itemId: offer._id,
      extraState: { name: phone?.title || "Offer" },
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/seller-offers")}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <div className="flex flex-wrap gap-2">
          <Permission permission={Permissions.SELLER_OFFER_MODERATE}>
            {offer.status === SellerOfferStatus.PAUSED && (
              <Button size="sm" onClick={() => openAction("activate")}>
                Activate
              </Button>
            )}
            {offer.status === SellerOfferStatus.ACTIVE && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAction("pause")}
              >
                Pause
              </Button>
            )}
          </Permission>

          <Permission permission={Permissions.SELLER_OFFER_DELETE}>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openAction("delete")}
            >
              Delete
            </Button>
          </Permission>
        </div>
      </div>

      {/* Offer hero */}
      <Card>
        <div className="flex flex-col gap-5 px-6 pb-6 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {phone?.title || "Unknown Phone"}
              </h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {variant
                  ? `${variant.ram}GB RAM / ${variant.storage}GB Storage`
                  : "Unknown Variant"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground md:text-right">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>
                Created{" "}
                <span className="font-semibold text-foreground">
                  {formatDateTime(offer.createdAt)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={offer.status} />
          </div>
        </div>
      </Card>

      {/* Data grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid content-start gap-6 md:grid-cols-2 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <TagIcon className="h-4 w-4" /> Offer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={WalletIcon}
                label="Seller Price"
                value={formatBDT(offer.price)}
              />
              <DetailRow icon={TagIcon} label="Currency" value={offer.currency} />
              <DetailRow
                icon={PackageIcon}
                label="Stock"
                value={offer.stock === 0 ? "Out of stock" : offer.stock.toString()}
                badge={
                  offer.stock === 0 ? (
                    <span className="text-xs text-amber-600 font-medium">
                      Out of stock
                    </span>
                  ) : undefined
                }
              />
              <DetailRow
                label="Expires At"
                value={formatDateTime(offer.expiresAt)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" /> Phone & Variant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={PhoneIcon}
                label="Phone"
                value={phone?.title}
                href={phone?._id ? `/phones/${phone._id}` : undefined}
              />
              <DetailRow label="Brand" value={phone?.brand} />
              <DetailRow
                label="Variant"
                value={
                  variant
                    ? `${variant.ram}GB RAM / ${variant.storage}GB Storage`
                    : null
                }
              />
              <DetailRow
                label="Official Price"
                value={
                  variant?.official_price
                    ? formatBDT(variant.official_price)
                    : null
                }
              />
              <DetailRow
                label="Unofficial Price"
                value={
                  variant?.unofficial_price
                    ? formatBDT(variant.unofficial_price)
                    : null
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Store className="h-4 w-4" /> Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={Store}
                label="Store Name"
                value={seller?.store_name}
                href={seller?._id ? `/sellers/${seller._id}` : undefined}
              />
              <DetailRow label="Store Slug" value={seller?.slug} />
              <div className="flex items-center justify-between gap-3 border-b border-muted pb-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Seller Status
                </span>
                <StatusBadge status={seller?.status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" /> Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label="Created At"
                value={formatDateTime(offer.createdAt)}
              />
              <DetailRow
                label="Updated At"
                value={formatDateTime(offer.updatedAt)}
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
  requiredPermissions: [Permissions.SELLER_OFFER_READ],
})
