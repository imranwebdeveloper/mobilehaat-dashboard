import React from "react"
import Select, { MultiValue } from "react-select"

export interface SelectOption {
  label: string
  value: string
}

interface SingleSelectProps {
  options?: SelectOption[]
  value?: SelectOption | null
  onChange?: (val: SelectOption | null) => void
  placeholder?: string
  isClearable?: boolean
  isDisabled?: boolean
  className?: string
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  options = [],
  value = null,
  onChange,
  placeholder = "Select...",
  isClearable = true,
  isDisabled = false,
  className,
}) => {
  return (
    <Select
      className={className}
      options={options}
      value={value}
      onChange={(val) => onChange?.(val)}
      classNamePrefix="custom-select"
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  )
}

export default SingleSelect

export interface SelectOption {
  label: string
  value: string
}

interface MultiSelectProps {
  options?: MultiValue<SelectOption>
  value?: SelectOption[] | null
  onChange?: (val: MultiValue<SelectOption>) => void
  placeholder?: string
  isClearable?: boolean
  isDisabled?: boolean
  className?: string
}
export const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  isClearable = true,
  isDisabled = false,
  className,
}) => {
  return (
    <Select
      className={className}
      options={options}
      value={value}
      onChange={(val) => onChange?.(val)}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      isMulti={true}
    />
  )
}
