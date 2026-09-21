"use client"

import { useWatch, type UseFormReturn } from "react-hook-form"

/**
 * Manages the cascading (`division` -> `district` -> `upazila`) address field
 * group. Changing a parent clears its child values and validation errors.
 * Generic over the field prefix so it stays reusable across forms.
 */
export const useGeoAddressFields = ({
  form,
  baseName = "address",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  baseName?: string
}) => {
  const divisionId =
    useWatch({ control: form.control, name: `${baseName}.division_id` }) ?? ""
  const districtId =
    useWatch({ control: form.control, name: `${baseName}.district_id` }) ?? ""

  const onDivisionChange = (id: string) => {
    form.setValue(`${baseName}.division_id`, id, { shouldValidate: true })
    form.setValue(`${baseName}.district_id`, "", { shouldDirty: true })
    form.setValue(`${baseName}.upazila_id`, "", { shouldDirty: true })
    form.clearErrors([
      `${baseName}.division_id`,
      `${baseName}.district_id`,
      `${baseName}.upazila_id`,
    ])
  }

  const onDistrictChange = (id: string) => {
    form.setValue(`${baseName}.district_id`, id, { shouldValidate: true })
    form.setValue(`${baseName}.upazila_id`, "", { shouldDirty: true })
    form.clearErrors([`${baseName}.district_id`, `${baseName}.upazila_id`])
  }

  const onUpazilaChange = (id: string) => {
    form.setValue(`${baseName}.upazila_id`, id, { shouldValidate: true })
    form.clearErrors(`${baseName}.upazila_id`)
  }

  return {
    divisionId,
    districtId,
    onDivisionChange,
    onDistrictChange,
    onUpazilaChange,
  }
}
