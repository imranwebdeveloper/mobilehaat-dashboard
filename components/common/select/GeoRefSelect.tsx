"use client"

import React, { useMemo, useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { GeoKind, useGeoList } from "@/hooks/useGeoLocations"

type GeoRefSide =
  | "bottom"
  | "left"
  | "right"
  | "top"
  | "inline-start"
  | "inline-end"

interface GeoRefSelectProps {
  kind: GeoKind
  parentId?: string
  value?: string
  onChange?: (id: string) => void
  placeholder?: string
  disabled?: boolean
  side?: GeoRefSide
}

const GeoRefSelect: React.FC<GeoRefSelectProps> = ({
  kind,
  parentId,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  side = "bottom",
}) => {
  const anchor = useComboboxAnchor()
  const { options, isLoading } = useGeoList(kind, parentId)
  const [search, setSearch] = useState("")

  const selected = useMemo(
    () => (value ? (options.find((o) => o.value === value) ?? null) : null),
    [options, value]
  )

  return (
    <Combobox
      key={`${kind}-${parentId ?? ""}-${value ?? ""}`}
      items={options}
      value={selected}
      autoHighlight
      itemToStringValue={(item) => item?.label || ""}
      inputValue={search ? search : selected?.label || ""}
      onInputValueChange={(v) => setSearch(v)}
      onValueChange={(val) => {
        onChange?.(val ? val.value : "")
        setSearch("")
      }}
      isItemEqualToValue={(item, val) => item?.value === val?.value}
    >
      <ComboboxInput
        className="w-full"
        placeholder={placeholder}
        disabled={disabled}
      />

      <ComboboxContent side={side} anchor={anchor}>
        {isLoading && (
          <div className="p-2 text-sm text-muted-foreground">Loading...</div>
        )}
        <ComboboxEmpty>No items found</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default GeoRefSelect
