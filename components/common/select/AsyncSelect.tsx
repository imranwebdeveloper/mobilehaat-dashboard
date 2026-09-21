/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { globalApi } from "@/store/global.api"
import { useDebounce } from "@/hooks/useDebounce"

export interface SelectOption {
  label: string
  value: string
}

type CommonProps = {
  url: string
  labelField?: string
  valueField?: string
  placeholder?: string
  searchField?: string
  side?: "bottom" | "left" | "right" | "top" | "inline-start" | "inline-end"
}

/* --------------------- Single Select Component --------------------- */
export const AsyncSingleSelect = ({
  url,
  value, // Now a single object
  onChange, // Single value callback
  labelField = "name",
  valueField = "_id",
  placeholder = "Select an option...",
  searchField = "name",
  side = "bottom",
  queryParams = {},
  renderItem,
  disabled = false,
  onOptionsChange,
}: CommonProps & {
  value?: SelectOption | null
  onChange?: (val: SelectOption | null, raw?: any) => void
  queryParams?: Record<string, string | number | undefined>
  renderItem?: (option: SelectOption, raw: any) => React.ReactNode
  disabled?: boolean
  onOptionsChange?: (options: SelectOption[]) => void
}) => {
  const anchor = useComboboxAnchor()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const { data, isLoading } = globalApi.useGetDataQuery({
    url,
    search: debouncedSearch,
    searchFields: searchField,
    ...queryParams,
  })

  const rawItems: any[] = data?.data || []
  const rawByValue = new Map(rawItems.map((item) => [item?.[valueField], item]))
  const fetchedOptions: SelectOption[] = rawItems.map((item: any) => ({
    label: item[labelField],
    value: item[valueField],
  }))

  useEffect(() => {
    if (onOptionsChange) {
      onOptionsChange(fetchedOptions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onOptionsChange])

  const handleChange = (val: SelectOption | null) => {
    onChange?.(val, val ? rawByValue.get(val.value) : undefined)
  }
  return (
    <Combobox
      items={fetchedOptions}
      value={value}
      autoHighlight
      itemToStringValue={(item) => item?.label || ""}
      inputValue={search ? search : value?.label || ""}
      onInputValueChange={(value) => setSearch(value)}
      onValueChange={handleChange}
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
              {renderItem
                ? renderItem(option, rawByValue.get(option.value))
                : option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
/* --------------------- Multi Select Component --------------------- */
export const AsyncMultiSelect = ({
  url,
  values = [],
  onMultiChange,
  labelField = "name",
  valueField = "_id",
  placeholder = "Search...",
  searchField = "name",
  side = "bottom",
}: CommonProps & {
  values?: SelectOption[]
  onMultiChange?: (vals: SelectOption[]) => void
}) => {
  const anchor = useComboboxAnchor()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = globalApi.useGetDataQuery({
    url,
    search: debouncedSearch,
    searchFields: searchField,
  })

  const fetchedOptions: SelectOption[] = (data?.data || []).map(
    (item: any) => ({
      label: item[labelField],
      value: item[valueField],
    })
  )

  const handleChange = (val: SelectOption[] | null) => {
    onMultiChange?.(val || [])
  }

  return (
    <Combobox
      multiple
      items={fetchedOptions}
      value={values}
      autoHighlight
      itemToStringValue={(item) => item.label}
      inputValue={search}
      onInputValueChange={(value) => setSearch(value)}
      onValueChange={handleChange}
      isItemEqualToValue={(item, value) => item.value === value.value}
    >
      <ComboboxChips ref={anchor} className="w-full">
        <ComboboxValue>
          {(selectedItems) => {
            const itemsArray = Array.isArray(selectedItems) ? selectedItems : []
            return (
              <>
                {itemsArray.map((s) => (
                  <ComboboxChip key={s.value}>{s.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder={placeholder} />
              </>
            )
          }}
        </ComboboxValue>
      </ComboboxChips>

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
