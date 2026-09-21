"use client"

import { useQueryContext } from "@/hooks/useQueryContext"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useModalContext } from "@/hooks/useModalContext"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"
import { SubscriptionStatus } from "./seller-subscription.type"
import { useGetAllSellersQuery } from "../sellers/seller.api"

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: SubscriptionStatus.PENDING, label: "Pending" },
  { value: SubscriptionStatus.ACTIVE, label: "Active" },
  { value: SubscriptionStatus.SUSPENDED, label: "Suspended" },
  { value: SubscriptionStatus.EXPIRED, label: "Expired" },
  { value: SubscriptionStatus.CANCELLED, label: "Cancelled" },
]

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()
  const { setAction } = useModalContext()

  const { data: sellersData } = useGetAllSellersQuery({
    limit: 100,
  })

  const sellers = sellersData?.data || []

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Active subscriptions grant sellers plan benefits. Paid plans are
            activated only after a payment is verified.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by seller name..."
              className="w-60 pl-9 bg-background"
              value={(query?.search as string) || ""}
              onChange={(e) => {
                setQuery({
                  search: e.target.value || undefined,
                })
              }}
            />
          </div>

          <Select
            value={
              query?.seller_id === undefined
                ? "all"
                : (query?.seller_id as string)
            }
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({ seller_id: undefined })
              } else {
                setQuery({ seller_id: value })
              }
            }}
          >
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Filter by Seller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sellers</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller._id} value={seller._id}>
                  {seller.store_name || seller.owner_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query?.status === undefined ? "all" : query?.status}
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({
                  status: undefined,
                })
              } else {
                setQuery({
                  status: value,
                })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Permission permission={Permissions.SELLER_SUBSCRIPTION_CREATE}>
            <Button onClick={() => setAction({ action: "create" })}>
              <Plus className="h-5 w-5" /> Add Subscription
            </Button>
          </Permission>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
