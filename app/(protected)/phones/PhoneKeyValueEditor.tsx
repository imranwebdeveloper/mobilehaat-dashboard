"use client"

import { Controller, type Control, useFieldArray } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"

import type { PhoneFormValues } from "./phones.dto"
import CreateAbleMultiSelect from "@/components/common/select/CreateAbleMultiSelect"
import {
  convertSelectOptionToString,
  convertStringArrayToSelectOption,
  covertStringToSelectOption,
} from "@/lib/select"
import { EXTRA_FIELD_SUGGESTIONS, getExtraFieldLabel } from "./phone.db"

export type KeyValuePath =
  | "os.others"
  | "platform.others"
  | "memory.others"
  | "display.others"
  | "battery.others"
  | "network.others"
  | "connectivity.others"
  | "body.others"
  | "sound.others"
  | "features.others"
  | "front_camera.others"
  | "back_camera.others"

type Props = {
  control: Control<PhoneFormValues>
  name: string
  title: string
  description?: string
}

export default function PhoneKeyValueEditor({
  control,
  name,
  title,
  description,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control: control as never,
    name: name as never,
  })

  const objName = name.split(".")[0]
  const obj = control._fields[objName] || {}
  const groups = [...Object.keys(obj)]

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-muted/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              name: "",
              value: "",
              value_type: "text",
              key: "",
              group: "others",
            } as never)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Spec
        </Button>
      </div>

      {fields.length ? (
        <div className="space-y-3">
          {fields.map((field, index) => {
            return (
              <div
                key={field.id + index}
                className="relative grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-2 xl:grid-cols-2"
              >
                <FormFieldWrapper label="Label">
                  <Controller
                    control={control}
                    name={`${name}.${index}.name` as never}
                    render={({ field }) => (
                      <CreateAbleMultiSelect
                        value={covertStringToSelectOption(field.value)}
                        onChange={(event) => {
                          field.onChange(convertSelectOptionToString(event))
                        }}
                        options={convertStringArrayToSelectOption(
                          getExtraFieldLabel(
                            objName as keyof typeof EXTRA_FIELD_SUGGESTIONS
                          )
                        )}
                        placeholder="Select or Create Label"
                        isMulti={false}
                      />
                    )}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Group">
                  <Controller
                    control={control}
                    name={`${name}.${index}.group` as never}
                    render={({ field }) => (
                      <CreateAbleMultiSelect
                        value={covertStringToSelectOption(field.value)}
                        onChange={(v) =>
                          field.onChange(convertSelectOptionToString(v))
                        }
                        options={convertStringArrayToSelectOption(groups)}
                        isMulti={false}
                        placeholder="LPDDR5X"
                      />
                    )}
                  />
                </FormFieldWrapper>
                <div className="col-span-2">
                  <FormFieldWrapper label="Value">
                    <Controller
                      control={control}
                      name={`${name}.${index}.value` as never}
                      render={({ field }) => (
                        <CreateAbleMultiSelect
                          value={covertStringToSelectOption(field.value)}
                          onChange={(event) => {
                            field.onChange(convertSelectOptionToString(event))
                          }}
                          placeholder="Value of the label"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                </div>

                {/* <FormFieldWrapper label="Type">
                  <Controller
                    control={control}
                    name={`${name}.${index}.value_type` as never}
                    render={({ field }) => (
                      <CreateAbleMultiSelect
                        value={covertStringToSelectOption(field.value)}
                        onChange={(v) =>
                          field.onChange(convertSelectOptionToString(v))
                        }
                        options={convertStringArrayToSelectOption(
                          valueTypes.map((option) => option.label)
                        )}
                        isMulti={false}
                        placeholder="LPDDR5X"
                      />
                    )}
                  />
                </FormFieldWrapper> */}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full border bg-background"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No extra specs added yet.
        </p>
      )}
    </div>
  )
}
