"use client"

import { Input } from "@/components/ui/input"
import { useQueryContext } from "@/hooks/useQueryContext"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Permission from "@/components/common/Permission"
import { Permissions } from "@/config/permissions"
import Link from "next/link"
import {
  SELLER_STATUS_OPTIONS,
  SELLER_VERIFICATION_OPTIONS,
  SELLER_BUSINESS_TYPE_OPTIONS,
} from "./seller.constant"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search store, owner, email or phone"
            value={query?.search || ""}
            onChange={(e) =>
              setQuery(
                {
                  searchFields: "store_name,owner_name,email,phone",
                  search: e.target.value,
                },
                { reset: true }
              )
            }
            className="bg-background pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select
            value={query?.status === undefined ? "all" : query?.status}
            onValueChange={(value) => {
              setQuery({
                status: value === "all" ? undefined : value,
              })
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {SELLER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              query?.verification_status === undefined
                ? "all"
                : query?.verification_status
            }
            onValueChange={(value) => {
              setQuery({
                verification_status: value === "all" ? undefined : value,
              })
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification</SelectItem>
              {SELLER_VERIFICATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              query?.business_type === undefined ? "all" : query?.business_type
            }
            onValueChange={(value) => {
              setQuery({
                business_type: value === "all" ? undefined : value,
              })
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Business Types</SelectItem>
              {SELLER_BUSINESS_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Permission permission={Permissions.SELLER_CREATE}>
            <Link href="/sellers/create">
              <Button>
                <Plus className="h-5 w-5" /> Add Seller
              </Button>
            </Link>
          </Permission>
        </div>
      </div>
    </div>
  )
}

export default TableHeader
