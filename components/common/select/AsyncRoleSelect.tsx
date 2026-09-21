import { globalApi } from "@/store/global.api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AsyncRoleSelectProps {
  value?: string
  onValueChange: (value: string) => void
  showAll?: boolean
  placeholder?: string
  valueKey?: "name" | "_id"
}
const AsyncRoleSelect = ({
  value,
  onValueChange,
  showAll = false,
  placeholder = "Select Role",
  valueKey = "name",
}: AsyncRoleSelectProps) => {
  const { data } = globalApi.useGetAllRoleQuery({})
  const roles = data?.data || []
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-40 bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">All Roles</SelectItem>}
        {roles.map((role) => (
          <SelectItem
            className="capitalize"
            key={role._id}
            value={role[valueKey] as string}
          >
            {role.name.charAt(0).toUpperCase() +
              role.name.slice(1).toLowerCase().split("_").join(" ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default AsyncRoleSelect
