"use client"

import { useQueryContext } from "@/hooks/useQueryContext"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetAllSellersQuery } from "../sellers/seller.api"

const PAYMENT_METHODS = [
  { value: "all", label: "All Methods" },
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
]

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()

  const { data: sellersData } = useGetAllSellersQuery({
    limit: 100,
  })

  const sellers = sellersData?.data || []

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Record and verify seller plan payments. Verifying a payment
            activates the matching subscription.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
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
            value={
              query?.payment_method === undefined
                ? "all"
                : (query?.payment_method as string)
            }
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({ payment_method: undefined })
              } else {
                setQuery({ payment_method: value })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
