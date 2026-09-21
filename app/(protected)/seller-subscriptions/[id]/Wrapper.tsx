"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  GiftIcon,
  Store,
  TagIcon,
  UsersIcon,
} from "lucide-react"

import { useGetSellerSubscriptionByIdQuery } from "../seller-subscription.api"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/common/StatusBadge"
import DetailRow from "@/components/common/DetailRow"
import Permission from "@/components/common/Permission"
import QueryAndModalWrapper from "@/components/providers/QueryAndModalWrapper"
import Modal from "../Modal"
import { useModalContext } from "@/hooks/useModalContext"
import { SubscriptionStatus } from "../seller-subscription.type"
import { formatBDT, formatDateTime, formatPeriod } from "@/lib/utils"

/* ------------------------------- content ------------------------------- */

const DetailContent = () => {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const { data, isLoading } = useGetSellerSubscriptionByIdQuery(itemId)
  const { setAction } = useModalContext()

  if (isLoading) {
    return (
      <div className="p-8 text-center">Loading subscription details...</div>
    )
  }

  if (!data?.data) {
    return (
      <div className="p-8 text-center text-destructive">
        Subscription not found
      </div>
    )
  }

  const subscription = data.data
  const seller = subscription.seller_id

  const openAction = (action: "cancel" | "status") => {
    setAction({
      action,
      itemId: subscription._id,
      extraState: {
        name: subscription.plan_name,
        currentStatus: subscription.status,
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/seller-subscriptions")}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <div className="flex flex-wrap gap-2">
          <Permission permission={Permissions.SELLER_SUBSCRIPTION_UPDATE}>
            {subscription.status === SubscriptionStatus.ACTIVE && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAction("cancel")}
              >
                Cancel Subscription
              </Button>
            )}
          </Permission>

          <Permission permission={Permissions.SELLER_SUBSCRIPTION_UPDATE}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAction("status")}
            >
              Change Status
            </Button>
          </Permission>
        </div>
      </div>

      {/* Subscription hero */}
      <Card>
        <div className="flex flex-col gap-5 px-6 pb-6 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {subscription.plan_name}
              </h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {seller?.store_name || "Unknown Seller"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground md:text-right">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>
                Started{" "}
                <span className="font-semibold text-foreground">
                  {formatDateTime(subscription.start_at)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={subscription.status} />
            {subscription.cancel_at_period_end && (
              <Badge variant="secondary">Cancels at period end</Badge>
            )}
            <Badge variant="outline" className="font-bold">
              {subscription.source}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Data grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid content-start gap-6 md:grid-cols-2 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <TagIcon className="h-4 w-4" /> Subscription Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                icon={TagIcon}
                label="Plan Name"
                value={subscription.plan_name}
                href="/seller-plans"
              />
              <DetailRow
                icon={CreditCardIcon}
                label="Price"
                value={formatBDT(subscription.price)}
              />
              <DetailRow label="Currency" value={subscription.currency} />
              <DetailRow
                icon={GiftIcon}
                label="Max Active Offers"
                value={subscription.max_active_offers.toString()}
              />
              <DetailRow
                label="Period"
                value={formatPeriod(subscription.period)}
              />
              <DetailRow
                label="Duration (Months)"
                value={subscription.duration_months.toString()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" /> Billing Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label="Start Date"
                value={formatDateTime(subscription.start_at)}
              />
              <DetailRow
                label="End Date"
                value={formatDateTime(subscription.end_at)}
              />
              <DetailRow
                label="Cancelled At"
                value={formatDateTime(subscription.cancelled_at)}
              />
              <DetailRow
                label="Cancel Reason"
                value={subscription.cancel_reason}
              />
              <DetailRow
                label="Renewal Count"
                value={subscription.renewal_count?.toString() || "0"}
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
                value={formatDateTime(subscription.createdAt)}
              />
              <DetailRow
                label="Updated At"
                value={formatDateTime(subscription.updatedAt)}
              />
            </CardContent>
          </Card>

          {subscription.previous_subscription_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" /> Previous Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Plan"
                  value={subscription.previous_subscription_id.plan_name}
                />
                <DetailRow
                  label="Status"
                  value={subscription.previous_subscription_id.status}
                />
                <DetailRow
                  label="Price"
                  value={
                    subscription.previous_subscription_id.price
                      ? formatBDT(subscription.previous_subscription_id.price)
                      : null
                  }
                />
              </CardContent>
            </Card>
          )}
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
  requiredPermissions: [Permissions.SELLER_SUBSCRIPTION_READ],
})
