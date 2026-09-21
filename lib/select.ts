export const convertStringArrayToSelectOption = (items?: string[] | null) => {
  return (items || []).map((item) => ({
    label: item,
    value: item,
  }))
}

export const convertSelectOptionToStringArray = (
  options?: { label: string; value: string }[] | null
) => {
  return (options || []).map((option) => option.value.trim())
}
export const covertStringToSelectOption = (value?: string) => {
  if (value === undefined || value === null || value.trim() === "") {
    return []
  }
  return (
    value?.split(",").map((item) => ({
      label: item.trim(),
      value: item.trim(),
    })) || []
  )
}

export const convertSelectOptionToString = (
  options?: { label: string; value: string }[] | null
) => {
  return (options || []).map((option) => option.value.trim()).join(", ")
}
