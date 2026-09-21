import React from "react"
import CreatableSelect from "react-select/creatable"

export interface SelectOption {
  label: string
  value: string
}

interface CreateAbleMultiSelectProps {
  options?: SelectOption[]
  value?: SelectOption[]
  onChange?: (val: SelectOption[]) => void
  placeholder?: string
  isMulti?: boolean
  isClearable?: boolean
  isDisabled?: boolean
  className?: string
  menuPlacement?: "bottom" | "top" | "auto"
}

const CreateAbleMultiSelect: React.FC<CreateAbleMultiSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  isMulti = true,
  isClearable = true,
  isDisabled = false,
  menuPlacement = "auto",
  className,
}) => {
  return (
    <CreatableSelect
      className={className}
      options={options}
      value={value}
      classNamePrefix="custom-select"
      onChange={(val) => {
        onChange?.(Array.isArray(val) ? val : val ? [val] : [])
      }}
      placeholder={placeholder}
      isMulti={isMulti}
      isClearable={isClearable}
      isDisabled={isDisabled}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      menuPlacement={menuPlacement}
    />
  )
}

export default CreateAbleMultiSelect
