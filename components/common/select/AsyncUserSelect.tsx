"use client"

import { useState } from "react"
import { AsyncSingleSelect, SelectOption } from "./AsyncSelect"
import { Badge } from "@/components/ui/badge"

interface AsyncUserSelectProps {
  onChange: (value: string) => void
  onSelectUser?: (user: UserSelectRaw | null) => void
  placeholder?: string
}

type UserSelectRaw = {
  _id: string
  first_name?: string
  last_name?: string
  full_name?: string
  email: string
  roles?: Array<{ _id: string; name: string }>
}

const AsyncUserSelect = ({
  onChange,
  onSelectUser,
  placeholder = "Search user by name or email",
}: AsyncUserSelectProps) => {
  const [option, setOption] = useState<SelectOption | null>(null)

  return (
    <AsyncSingleSelect
      url="/users"
      value={option}
      onChange={(val, raw) => {
        setOption(val)
        const user = (raw as UserSelectRaw) || null
        onChange(val?.value || "")
        onSelectUser?.(user)
      }}
      labelField="full_name"
      valueField="_id"
      searchField="first_name,last_name,email"
      queryParams={{ role: "SELLER", limit: 20 }}
      placeholder={placeholder}
      renderItem={(selected, raw) => {
        const user = (raw as UserSelectRaw) || {}
        const name = selected.label || user.email || "Unknown user"
        const email = user.email || ""
        const roleName = user.roles?.[0]?.name || "USER"

        return (
          <div className="flex w-full flex-col gap-0.5">
            <span className="font-medium">{name}</span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {email || "No email"}
              <Badge variant="secondary" className="text-[10px]">
                {roleName}
              </Badge>
            </span>
          </div>
        )
      }}
    />
  )
}

export default AsyncUserSelect
