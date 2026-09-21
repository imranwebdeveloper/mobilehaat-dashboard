"use client"

import { useState } from "react"
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
  AsyncSingleSelect,
  SelectOption,
} from "@/components/common/select/AsyncSelect"
import { BDStatus, PhoneStatus, PhoneType } from "./phones.constant"

const TableHeader = () => {
  const { setQuery, query } = useQueryContext()
  const [brandFilter, setBrandFilter] = useState<SelectOption | null>(null)

  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or model"
          value={query?.search || ""}
          onChange={(e) =>
            setQuery(
              {
                searchFields: "title",
                search: e.target.value,
              },
              { reset: true }
            )
          }
          className="bg-background pl-9"
        />
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="w-full bg-background md:w-52">
          <AsyncSingleSelect
            value={brandFilter}
            onChange={(value: SelectOption | null) => {
              setBrandFilter(value)
              setQuery({
                brand: value?.value || undefined,
              })
            }}
            url="/brands"
            placeholder="Filter by Brand"
          />
        </div>

        <Select
          value={query?.phone_type === undefined ? "all" : query?.phone_type}
          onValueChange={(value) => {
            setQuery({
              phone_type: value === "all" ? undefined : value,
            })
          }}
        >
          <SelectTrigger className="w-44 bg-background">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(PhoneType).map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type.replaceAll("_", " ")}
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
            {Object.values(PhoneStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query?.bd_status === undefined ? "all" : query?.bd_status}
          onValueChange={(value) => {
            if (value === "all") {
              setQuery({
                bd_status: undefined,
              })
            } else {
              setQuery({
                bd_status: value,
              })
            }
          }}
        >
          <SelectTrigger className="w-40 bg-background">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All BD Status</SelectItem>
            {Object.values(BDStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Permission permission={Permissions.PHONE_CREATE}>
          <Link href="/phones/create">
            <Button>
              <Plus className="h-5 w-5" /> Add Phone
            </Button>
          </Link>
        </Permission>
      </div>
    </div>
  )
}

export default TableHeader
