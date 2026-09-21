"use client"

import { useQueryContext } from "@/hooks/useQueryContext"
import { useGetAllSellersQuery } from "../sellers/seller.api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
            Offers are product listings created by sellers. Moderators can
            activate, pause, or delete offers that violate marketplace rules.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by phone name..."
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
            value={query?.status === undefined ? "all" : (query?.status as string)}
            onValueChange={(value) => {
              if (value === "all") {
                setQuery({ status: undefined })
              } else {
                setQuery({ status: value })
              }
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
