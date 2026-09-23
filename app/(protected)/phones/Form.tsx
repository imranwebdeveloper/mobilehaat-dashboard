/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type { ChangeEvent } from "react"
import {
  Controller,
  useFieldArray,
  Control,
  useForm,
  FormProvider,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
} from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { MediaPicker } from "../media/MediaPicker"
import { usePhoneForm } from "./usePhoneForm"
import { IMedia } from "../media/media.type"
import { PhoneFormValues } from "./phones.dto"
import { PhoneFormDraft } from "./ai/ai.types"
import { PhoneStatus, PhoneType, BDStatus, CameraType } from "./phones.constant"
import {
  AsyncMultiSelect,
  AsyncSingleSelect,
} from "@/components/common/select/AsyncSelect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import CreateAbleMultiSelect from "@/components/common/select/CreateAbleMultiSelect"
import {
  convertSelectOptionToString,
  convertSelectOptionToStringArray,
  convertStringArrayToSelectOption,
  covertStringToSelectOption,
} from "@/lib/select"
import {
  batteryFeatures,
  bodyBuilds,
  bodyCertifications,
  cameraFeatures,
  CPU_CORE_OPTIONS,
  displayFeatures,
  EXTRA_PRESETS,
  memoryFeatures,
  networkTechnologyOptions,
  phonePositioningOptions,
  phoneSensors,
  RAM_TYPES,
  simSlotOptions,
  simTypeOptions,
  soundFeatures,
  specialFeatures,
} from "./phone.db"
import SingleSelect from "@/components/common/select/SingleSelect"
import FullWidthLoading from "@/components/common/loading/FullWidthLoading"
import PhoneKeyValueEditor from "./PhoneKeyValueEditor"

const EXTRA_GROUP_KEY_OPTIONS = [
  { label: "Display", value: "display" },
  { label: "Memory", value: "memory" },
  { label: "Camera", value: "camera" },
  { label: "Battery", value: "battery" },
  { label: "Network", value: "network" },
  { label: "Connectivity", value: "connectivity" },
  { label: "Body", value: "body" },
  { label: "Sound", value: "sound" },
  { label: "Platform", value: "platform" },
  { label: "OS", value: "os" },
  { label: "Features", value: "features" },
]

interface CameraListProps {
  control: Control<any>
  name: string

  fields: FieldArrayWithId<any, string>[]

  append: UseFieldArrayAppend<any, string>
  remove: (index: number) => void
  title: string
}

function CameraList({
  control,
  name,
  fields,
  append,
  remove,
  title,
}: CameraListProps) {
  const handleNumberInput =
    (onChange: (value: number) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      onChange(value === "" ? Number.NaN : Number(value))
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            append({
              type: CameraType.WIDE,
              mp: Number.NaN,
              aperture: "",
              sensor_size: "",
              pixel_size: "",
              focal_length: "",
              zoom: Number.NaN,
              features: [],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Camera
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative grid gap-4 rounded-lg border p-4 md:grid-cols-2"
          >
            <FormFieldWrapper label="Type" required>
              <Controller
                control={control}
                name={`${name}.cameras.${index}.type`}
                render={({ field }) => (
                  <SingleSelect
                    options={Object.values(CameraType).map((t) => ({
                      label: t,
                      value: t,
                    }))}
                    value={
                      field.value
                        ? { label: field.value, value: field.value }
                        : null
                    }
                    onChange={(val) => field.onChange(val?.value)}
                    placeholder="Select Camera Type"
                  />
                )}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="MP">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.mp`}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    value={Number.isNaN(field.value) ? "" : (field.value ?? "")}
                    onChange={handleNumberInput(field.onChange)}
                    placeholder="50"
                  />
                )}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Aperture">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.aperture`}
                render={({ field }) => <Input {...field} placeholder="f/1.8" />}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Sensor Size">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.sensor_size`}
                render={({ field }) => (
                  <Input {...field} placeholder='1/1.56"' />
                )}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Pixel Size">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.pixel_size`}
                render={({ field }) => <Input {...field} placeholder="1.0µm" />}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Focal Length">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.focal_length`}
                render={({ field }) => <Input {...field} placeholder="24mm" />}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Zoom (x)">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.zoom`}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    value={Number.isNaN(field.value) ? "" : (field.value ?? "")}
                    onChange={handleNumberInput(field.onChange)}
                    placeholder="3"
                  />
                )}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Features" className="md:col-span-2">
              <Controller
                control={control}
                name={`${name}.cameras.${index}.features`}
                render={({ field }) => (
                  <CreateAbleMultiSelect
                    value={convertStringArrayToSelectOption(field.value)}
                    onChange={(event) => {
                      field.onChange(convertSelectOptionToStringArray(event))
                    }}
                    options={convertStringArrayToSelectOption(cameraFeatures)}
                    placeholder="OIS, PDAF, Laser AF, etc."
                  />
                )}
              />
            </FormFieldWrapper>
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
        ))}

        <div className="space-y-4 border-t pt-4">
          <FormFieldWrapper label="System Features">
            <Controller
              control={control}
              name={`${name}.features`}
              render={({ field }) => (
                <CreateAbleMultiSelect
                  value={convertStringArrayToSelectOption(field.value)}
                  onChange={(event) => {
                    field.onChange(convertSelectOptionToStringArray(event))
                  }}
                  options={convertStringArrayToSelectOption(cameraFeatures)}
                  placeholder="LED flash, HDR, Panorama"
                />
              )}
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Videos">
            <Controller
              control={control}
              name={`${name}.videos`}
              render={({ field }) => (
                <CreateAbleMultiSelect
                  value={convertStringArrayToSelectOption(field.value)}
                  onChange={(event) => {
                    field.onChange(convertSelectOptionToStringArray(event))
                  }}
                  placeholder="8K@24/30fps, 4K@30/60fps"
                />
              )}
            />
          </FormFieldWrapper>
          <PhoneKeyValueEditor
            control={control}
            name={`${name}.others`}
            title="Additional Camera Specs"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function PhoneForm(props?: {
  draft?: PhoneFormDraft | null
  onDraftConsumed?: () => void
}) {
  const methods = useForm()
  const {
    form,
    thumbnail,
    setThumbnail,
    images,
    setImages,
    brand,
    setBrand,
    categories,
    setCategories,
    variantFields,
    appendVariant,
    removeVariant,
    frontCameraFields,
    appendFrontCamera,
    removeFrontCamera,
    backCameraFields,
    appendBackCamera,
    removeBackCamera,
    sourceFields,
    appendSource,
    removeSource,
    extraFields,
    appendExtra,
    removeExtra,
    onSubmit,
    isLoading,
    isEdit,
    handleCancel,
    isFetching,
    handleGenerateSlug,
  } = usePhoneForm({
    draft: props?.draft,
    onDraftConsumed: props?.onDraftConsumed,
  })

  const phoneTypes = form.watch("phone_type") || []
  const phoneCategories = form.watch("types") || []
  const extrasValue = form.watch("extras") || []

  const handleExtraPresetToggle = (
    preset: (typeof EXTRA_PRESETS)[number],
    checked: boolean
  ) => {
    const currentExtras = form.getValues("extras") || []
    const existingIndex = currentExtras.findIndex(
      (extra) =>
        extra.group_key === preset.group_key &&
        extra.label.toLowerCase() === preset.label.toLowerCase()
    )
    if (checked) {
      if (existingIndex !== -1) return
      const maxOrder = currentExtras.reduce(
        (max, extra) => Math.max(max, extra.order ?? 0),
        -1
      )
      appendExtra({
        group_key: preset.group_key,
        label: preset.label,
        value: preset.value,
        order: maxOrder + 1,
      })
    } else if (existingIndex !== -1) {
      removeExtra(existingIndex)
    }
  }

  const handleNumberInput =
    (onChange: (value: number) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      onChange(value === "" ? Number.NaN : Number(value))
    }

  if (isFetching) {
    return <FullWidthLoading />
  }
  return (
    <FormProvider {...methods}>
      <div className="w-full p-6 pb-24">
        <form
          id="phone-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 space-y-4">
              {/* General Information */}
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper
                    label="Title"
                    required
                    error={form.formState.errors.title?.message}
                  >
                    <Controller
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Samsung Galaxy S24 Ultra"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper
                    label="Model"
                    required
                    error={form.formState.errors.model?.message}
                  >
                    <Controller
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <Input {...field} placeholder="Galaxy S24 Ultra" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper
                    label="Brand"
                    required
                    error={form.formState.errors.brand?.message}
                  >
                    <AsyncSingleSelect
                      value={brand}
                      onChange={(v) => {
                        setBrand(v)
                        form.setValue("brand", v?.value || "")
                      }}
                      url="/brands"
                      placeholder="Select brand"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper
                    label="Categories"
                    error={form.formState.errors.categories?.message as string}
                  >
                    <Controller
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <AsyncMultiSelect
                          url="/phone-categories"
                          values={categories}
                          onMultiChange={(values) => {
                            setCategories(values)
                            field.onChange(values.map((item) => item.value))
                          }}
                          placeholder="Assign one or more categories"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper
                    label="Slug"
                    error={form.formState.errors.slug?.message}
                  >
                    <div className="flex gap-2">
                      <Controller
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="samsung-galaxy-s24-ultra"
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleGenerateSlug}
                      >
                        Auto
                      </Button>
                    </div>
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Announced">
                    <Controller
                      control={form.control}
                      name="announced"
                      render={({ field }) => <Input {...field} type="date" />}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Released">
                    <Controller
                      control={form.control}
                      name="released"
                      render={({ field }) => <Input {...field} type="date" />}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              {/* Variants */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pricing Variants</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      appendVariant({
                        ram: 0,
                        storage: 0,
                        official_price: 0,
                        unofficial_price: 0,
                        currency: "BDT",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Variant
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variantFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative grid gap-4 rounded-lg border p-4 md:grid-cols-4"
                    >
                      <FormFieldWrapper label="RAM (GB)" required>
                        <Controller
                          control={form.control}
                          name={`variants.${index}.ram`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              value={
                                isNaN(field.value) ? "" : (field.value ?? 0)
                              }
                              onChange={handleNumberInput(field.onChange)}
                            />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Storage (GB)" required>
                        <Controller
                          control={form.control}
                          name={`variants.${index}.storage`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              value={
                                isNaN(field.value) ? "" : (field.value ?? 0)
                              }
                              onChange={handleNumberInput(field.onChange)}
                            />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Official Price">
                        <Controller
                          control={form.control}
                          name={`variants.${index}.official_price`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              value={
                                Number.isNaN(field.value)
                                  ? ""
                                  : (field.value ?? "")
                              }
                              onChange={handleNumberInput(field.onChange)}
                            />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Unofficial Price">
                        <Controller
                          control={form.control}
                          name={`variants.${index}.unofficial_price`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              value={
                                Number.isNaN(field.value)
                                  ? ""
                                  : (field.value ?? "")
                              }
                              onChange={handleNumberInput(field.onChange)}
                            />
                          )}
                        />
                      </FormFieldWrapper>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full border bg-background"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Platform & OS */}
              <Card>
                <CardHeader>
                  <CardTitle>Operating System & Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormFieldWrapper label="OS Name" required>
                      <Controller
                        control={form.control}
                        name="os.name"
                        render={({ field }) => (
                          <Input {...field} placeholder="Android 14" />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Custom UI">
                      <Controller
                        control={form.control}
                        name="os.custom_ui"
                        render={({ field }) => (
                          <Input {...field} placeholder="One UI 6.1" />
                        )}
                      />
                    </FormFieldWrapper>
                  </div>
                  <PhoneKeyValueEditor
                    control={form.control}
                    name="os.others"
                    title="OS Extras"
                  />

                  <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
                    <FormFieldWrapper label="Chipset">
                      <Controller
                        control={form.control}
                        name="platform.chipset"
                        render={({ field }) => (
                          <Input {...field} placeholder="Snapdragon 8 Gen 3" />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="CPU">
                      <Controller
                        control={form.control}
                        name="platform.cpu"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={covertStringToSelectOption(field.value)}
                            onChange={(v) =>
                              field.onChange(convertSelectOptionToString(v))
                            }
                            options={convertStringArrayToSelectOption(
                              CPU_CORE_OPTIONS.map((option) => option.label)
                            )}
                            isMulti={false}
                            placeholder="Octa-Core"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="GPU">
                      <Controller
                        control={form.control}
                        name="platform.gpu"
                        render={({ field }) => (
                          <Input {...field} placeholder="Adreno 750" />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Fabrication">
                      <Controller
                        control={form.control}
                        name="platform.fabrication"
                        render={({ field }) => (
                          <Input {...field} placeholder="4 nm" />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="RAM Type">
                      <Controller
                        control={form.control}
                        name="platform.ram_type"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={covertStringToSelectOption(field.value)}
                            onChange={(v) =>
                              field.onChange(convertSelectOptionToString(v))
                            }
                            options={convertStringArrayToSelectOption(
                              RAM_TYPES
                            )}
                            isMulti={false}
                            placeholder="LPDDR5X"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                  </div>
                  <PhoneKeyValueEditor
                    control={form.control}
                    name="platform.others"
                    title="Platform Extras"
                  />
                </CardContent>
              </Card>

              {/* Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Display</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper label="Type" required>
                    <Controller
                      control={form.control}
                      name="display.type"
                      render={({ field }) => (
                        <Input {...field} placeholder="LTPO AMOLED 2X" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Size" required>
                    <Controller
                      control={form.control}
                      name="display.size"
                      render={({ field }) => (
                        <Input {...field} placeholder="6.8 inches" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Resolution" required>
                    <Controller
                      control={form.control}
                      name="display.resolution"
                      render={({ field }) => (
                        <Input {...field} placeholder="1440 x 3120 pixels" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Protection">
                    <Controller
                      control={form.control}
                      name="display.protection"
                      render={({ field }) => (
                        <Input {...field} placeholder="Gorilla Armor" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Refresh Rate (Hz)">
                    <Controller
                      control={form.control}
                      name="display.refresh_rate"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          value={
                            Number.isNaN(field.value) ? "" : (field.value ?? "")
                          }
                          onChange={handleNumberInput(field.onChange)}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Aspect Ratio">
                    <Controller
                      control={form.control}
                      name="display.aspect_ratio"
                      render={({ field }) => (
                        <Input {...field} placeholder="19.5:9" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Brightness">
                    <Controller
                      control={form.control}
                      name="display.brightness"
                      render={({ field }) => (
                        <Input {...field} placeholder="2600 nits (peak)" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Body Ratio">
                    <Controller
                      control={form.control}
                      name="display.body_ratio"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="111.0 cm2 (~85.1% screen-to-body ratio)"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <div className="md:col-span-2">
                    <PhoneKeyValueEditor
                      control={form.control}
                      name="display.others"
                      title="Display Extras"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Memory */}
              <Card>
                <CardHeader>
                  <CardTitle>Memory & Storage</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper label="Card Slot">
                    <Controller
                      control={form.control}
                      name="memory.card_slot"
                      render={({ field }) => (
                        <Input {...field} placeholder="No / microSDXC" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Internal (Description)">
                    <Controller
                      control={form.control}
                      name="memory.internal"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="256GB 12GB RAM, 512GB 12GB RAM"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Storage Type">
                    <Controller
                      control={form.control}
                      name="memory.storage_type"
                      render={({ field }) => (
                        <Input {...field} placeholder="UFS 4.0" />
                      )}
                    />
                  </FormFieldWrapper>
                  <div className="md:col-span-2">
                    <PhoneKeyValueEditor
                      control={form.control}
                      name="memory.others"
                      title="Memory Extras"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cameras */}
              <CameraList
                control={form.control}
                name="back_camera"
                fields={backCameraFields}
                append={appendBackCamera}
                remove={removeBackCamera}
                title="Back Camera System"
              />
              <CameraList
                control={form.control}
                name="front_camera"
                fields={frontCameraFields}
                append={appendFrontCamera}
                remove={removeFrontCamera}
                title="Front Camera System"
              />

              {/* Battery */}
              <Card>
                <CardHeader>
                  <CardTitle>Battery</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper label="Capacity (mAh)" required>
                    <Controller
                      control={form.control}
                      name="battery.capacity"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          value={
                            Number.isNaN(field.value) ? "" : (field.value ?? "")
                          }
                          onChange={handleNumberInput(field.onChange)}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Type">
                    <Controller
                      control={form.control}
                      name="battery.type"
                      render={({ field }) => (
                        <Input {...field} placeholder="Li-Ion / Li-Po" />
                      )}
                    />
                  </FormFieldWrapper>
                  <div className="md:col-span-2">
                    <PhoneKeyValueEditor
                      control={form.control}
                      name="battery.others"
                      title="Battery Extras"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Network & Connectivity */}
              <Card>
                <CardHeader>
                  <CardTitle>Network & Connectivity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormFieldWrapper label="SIM Slot">
                      <Controller
                        control={form.control}
                        name="network.sim_slot"
                        render={({ field }) => (
                          // <Input {...field} placeholder="Dual SIM" />
                          <CreateAbleMultiSelect
                            value={covertStringToSelectOption(field.value)}
                            onChange={(v) =>
                              field.onChange(convertSelectOptionToString(v))
                            }
                            options={convertStringArrayToSelectOption(
                              simSlotOptions
                            )}
                            isMulti={false}
                            placeholder="Dual SIM"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="SIM Type">
                      <Controller
                        control={form.control}
                        name="network.sim_type"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={covertStringToSelectOption(field.value)}
                            onChange={(v) =>
                              field.onChange(convertSelectOptionToString(v))
                            }
                            options={convertStringArrayToSelectOption(
                              simTypeOptions
                            )}
                            isMulti={false}
                            placeholder="Nano-SIM"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Technology">
                      <Controller
                        control={form.control}
                        name="network.technology"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={convertStringArrayToSelectOption(
                              field.value
                            )}
                            onChange={(v) =>
                              field.onChange(
                                convertSelectOptionToStringArray(v)
                              )
                            }
                            options={convertStringArrayToSelectOption(
                              networkTechnologyOptions
                            )}
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Network Speed">
                      <Controller
                        control={form.control}
                        name="network.speed"
                        render={({ field }) => (
                          <Input {...field} placeholder="HSPA, LTE, 5G" />
                        )}
                      />
                    </FormFieldWrapper>
                  </div>
                  <PhoneKeyValueEditor
                    control={form.control}
                    name="network.others"
                    title="Network Extras"
                  />

                  <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
                    <FormFieldWrapper label="WiFi">
                      <Controller
                        control={form.control}
                        name="connectivity.wifi"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Wi-Fi 802.11 a/b/g/n/ac/6e/7"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Bluetooth">
                      <Controller
                        control={form.control}
                        name="connectivity.bluetooth"
                        render={({ field }) => (
                          <Input {...field} placeholder="5.3, A2DP, LE" />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="USB">
                      <Controller
                        control={form.control}
                        name="connectivity.usb"
                        render={({ field }) => (
                          <Input {...field} placeholder="USB Type-C 3.2" />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Positioning">
                      <Controller
                        control={form.control}
                        name="connectivity.positioning"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={covertStringToSelectOption(field.value)}
                            onChange={(v) =>
                              field.onChange(convertSelectOptionToString(v))
                            }
                            options={convertStringArrayToSelectOption(
                              phonePositioningOptions
                            )}
                            placeholder="GPS, GLONASS, GALILEO, BDS"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Controller
                          control={form.control}
                          name="connectivity.nfc"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label className="text-sm">NFC</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Controller
                          control={form.control}
                          name="connectivity.radio"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label className="text-sm">Radio</label>
                      </div>
                    </div>
                  </div>
                  <PhoneKeyValueEditor
                    control={form.control}
                    name="connectivity.others"
                    title="Connectivity Extras"
                  />
                </CardContent>
              </Card>

              {/* Body */}
              <Card>
                <CardHeader>
                  <CardTitle>Body</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper label="Dimensions">
                    <Controller
                      control={form.control}
                      name="body.dimensions"
                      render={({ field }) => (
                        <Input {...field} placeholder="162.3 x 79 x 8.6 mm" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Weight (g)">
                    <Controller
                      control={form.control}
                      name="body.weight_g"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          value={
                            Number.isNaN(field.value) ? "" : (field.value ?? "")
                          }
                          onChange={handleNumberInput(field.onChange)}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Build">
                    <Controller
                      control={form.control}
                      name="body.build"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Glass front, Titanium frame"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Colors">
                    <Controller
                      control={form.control}
                      name="body.colors"
                      render={({ field }) => (
                        <CreateAbleMultiSelect
                          value={convertStringArrayToSelectOption(field.value)}
                          onChange={(v) =>
                            field.onChange(convertSelectOptionToStringArray(v))
                          }
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Certifications">
                    <Controller
                      control={form.control}
                      name="body.certifications"
                      render={({ field }) => (
                        <CreateAbleMultiSelect
                          value={convertStringArrayToSelectOption(field.value)}
                          onChange={(v) =>
                            field.onChange(convertSelectOptionToStringArray(v))
                          }
                          options={convertStringArrayToSelectOption(
                            bodyCertifications
                          )}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <div className="md:col-span-2">
                    <PhoneKeyValueEditor
                      control={form.control}
                      name="body.others"
                      title="Body Extras"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sound & Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Sound & Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Controller
                          control={form.control}
                          name="sound.loudspeaker"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label className="text-sm">Loudspeaker</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Controller
                          control={form.control}
                          name="sound.jack_3_5mm"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label className="text-sm">3.5mm Jack</label>
                      </div>
                    </div>
                    <FormFieldWrapper
                      label="Sound Features"
                      className="md:col-span-2"
                    >
                      <Controller
                        control={form.control}
                        name="sound.features"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={convertStringArrayToSelectOption(
                              field.value
                            )}
                            onChange={(v) =>
                              field.onChange(
                                convertSelectOptionToStringArray(v)
                              )
                            }
                            options={convertStringArrayToSelectOption(
                              soundFeatures
                            )}
                          />
                        )}
                      />
                    </FormFieldWrapper>
                  </div>
                  <PhoneKeyValueEditor
                    control={form.control}
                    name="sound.others"
                    title="Sound Extras"
                  />

                  <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
                    <FormFieldWrapper label="Fingerprint">
                      <Controller
                        control={form.control}
                        name="features.fingerprint"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Under display, ultrasonic"
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Sensors">
                      <Controller
                        control={form.control}
                        name="features.sensors"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={convertStringArrayToSelectOption(
                              field.value
                            )}
                            onChange={(v) =>
                              field.onChange(
                                convertSelectOptionToStringArray(v)
                              )
                            }
                            options={convertStringArrayToSelectOption(
                              phoneSensors
                            )}
                          />
                        )}
                      />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Special Features">
                      <Controller
                        control={form.control}
                        name="features.special"
                        render={({ field }) => (
                          <CreateAbleMultiSelect
                            value={convertStringArrayToSelectOption(
                              field.value
                            )}
                            onChange={(v) =>
                              field.onChange(
                                convertSelectOptionToStringArray(v)
                              )
                            }
                            options={convertStringArrayToSelectOption(
                              specialFeatures
                            )}
                          />
                        )}
                      />
                    </FormFieldWrapper>
                  </div>
                  <PhoneKeyValueEditor
                    control={form.control}
                    name="features.others"
                    title="Features Extras"
                  />
                </CardContent>
              </Card>

              {/* Editorial */}
              <Card>
                <CardHeader>
                  <CardTitle>Editorial (Pros & Cons)</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper label="Pros">
                    <Controller
                      control={form.control}
                      name="pros"
                      render={({ field }) => (
                        <CreateAbleMultiSelect
                          value={convertStringArrayToSelectOption(field.value)}
                          onChange={(v) =>
                            field.onChange(convertSelectOptionToStringArray(v))
                          }
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Cons">
                    <Controller
                      control={form.control}
                      name="cons"
                      render={({ field }) => (
                        <CreateAbleMultiSelect
                          value={convertStringArrayToSelectOption(field.value)}
                          onChange={(v) =>
                            field.onChange(convertSelectOptionToStringArray(v))
                          }
                        />
                      )}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              {/* Extras */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Extra Specs</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      appendExtra({
                        group_key: "",
                        label: "",
                        value: "",
                        order: 0,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Extra
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {EXTRA_PRESETS.map((preset) => {
                      const checked = extrasValue.some(
                        (extra) =>
                          extra.group_key === preset.group_key &&
                          extra.label.toLowerCase() ===
                            preset.label.toLowerCase()
                      )
                      return (
                        <div
                          key={`${preset.group_key}-${preset.label}`}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`extra-preset-${preset.group_key}-${preset.label}`}
                            checked={checked}
                            onCheckedChange={(value) =>
                              handleExtraPresetToggle(preset, value === true)
                            }
                          />
                          <label
                            htmlFor={`extra-preset-${preset.group_key}-${preset.label}`}
                            className="text-sm font-medium"
                          >
                            {preset.label}
                            <span className="ml-1 font-normal text-muted-foreground">
                              ({preset.group_key}: {preset.value})
                            </span>
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  {extraFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative grid gap-4 rounded-lg border p-4 md:grid-cols-4"
                    >
                      <FormFieldWrapper label="Group Key">
                        <Controller
                          control={form.control}
                          name={`extras.${index}.group_key`}
                          render={({ field }) => (
                            <SingleSelect
                              options={EXTRA_GROUP_KEY_OPTIONS}
                              value={
                                EXTRA_GROUP_KEY_OPTIONS.find(
                                  (opt) => opt.value === field.value
                                ) || null
                              }
                              onChange={(val) =>
                                field.onChange(val?.value || "")
                              }
                              placeholder="Select group..."
                              isClearable
                            />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Label">
                        <Controller
                          control={form.control}
                          name={`extras.${index}.label`}
                          render={({ field }) => (
                            <Input {...field} placeholder="Cover Display" />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Value">
                        <Controller
                          control={form.control}
                          name={`extras.${index}.value`}
                          render={({ field }) => (
                            <Input {...field} placeholder="OLED" />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Order">
                        <Controller
                          control={form.control}
                          name={`extras.${index}.order`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? 0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          )}
                        />
                      </FormFieldWrapper>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full border bg-background"
                        onClick={() => removeExtra(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sources */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sources</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => appendSource({ label: "", url: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Source
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sourceFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative grid gap-4 rounded-lg border p-4 md:grid-cols-2"
                    >
                      <FormFieldWrapper label="Label">
                        <Controller
                          control={form.control}
                          name={`sources.${index}.label`}
                          render={({ field }) => (
                            <Input {...field} placeholder="GSMArena" />
                          )}
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="URL">
                        <Controller
                          control={form.control}
                          name={`sources.${index}.url`}
                          render={({ field }) => (
                            <Input {...field} placeholder="https://..." />
                          )}
                        />
                      </FormFieldWrapper>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full border bg-background"
                        onClick={() => removeSource(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="flex w-full flex-col-reverse gap-4 md:flex-col lg:w-[350px]">
              {/* Actions Card */}
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="flex-1"
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : isEdit
                      ? "Update Phone"
                      : "Create Phone"}
                </Button>
              </div>
              {/* Phone Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggested Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {phoneCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {phoneCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full border bg-muted px-2.5 py-1 text-xs font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No AI categories yet. Use the Categories selector above to
                      assign categories manually.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Media Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper label="Thumbnail (Main Image)" required>
                    <MediaPicker
                      value={thumbnail || undefined}
                      onChange={(m) => {
                        const nextThumbnail = (m as IMedia | undefined) ?? null
                        setThumbnail(nextThumbnail)
                        form.setValue(
                          "thumbnail",
                          nextThumbnail?._id || undefined
                        )
                      }}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Gallery">
                    <MediaPicker
                      multiple
                      value={images}
                      onChange={(media) => {
                        const nextImages = Array.isArray(media)
                          ? (media as IMedia[])
                          : []
                        setImages(nextImages)
                        form.setValue(
                          "images",
                          nextImages.map((img) => img._id)
                        )
                      }}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              {/* Status & BD Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Publishing & BD Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper label="Publish Status" required>
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <SingleSelect
                          options={Object.values(PhoneStatus).map((s) => ({
                            label: s,
                            value: s,
                          }))}
                          value={
                            field.value
                              ? { label: field.value, value: field.value }
                              : null
                          }
                          onChange={(val) => field.onChange(val?.value)}
                          isClearable={false}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="BD Market Status">
                    <Controller
                      control={form.control}
                      name="bd_status"
                      render={({ field }) => (
                        <SingleSelect
                          options={Object.values(BDStatus).map((s) => ({
                            label: s,
                            value: s,
                          }))}
                          value={
                            field.value
                              ? { label: field.value, value: field.value }
                              : null
                          }
                          onChange={(val) => field.onChange(val?.value)}
                          isClearable={false}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Approx. BD Price">
                    <Controller
                      control={form.control}
                      name="approximate_price_bd"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          value={
                            Number.isNaN(field.value) ? "" : (field.value ?? "")
                          }
                          onChange={handleNumberInput(field.onChange)}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Expert Rating (0-5)">
                    <Controller
                      control={form.control}
                      name="expert_rating"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={
                            Number.isNaN(field.value) ? "" : (field.value ?? "")
                          }
                          onChange={handleNumberInput(field.onChange)}
                        />
                      )}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>

              {/* Phone Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Phone Type</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {Object.values(PhoneType).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={phoneTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...phoneTypes, type]
                            : phoneTypes.filter((t) => t !== type)
                          form.setValue("phone_type", next, {
                            shouldValidate: true,
                          })
                        }}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium capitalize"
                      >
                        {type.replace("_", " ")}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Meta Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldWrapper label="Meta Title">
                    <Controller
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <Input {...field} placeholder="SEO title" />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Meta Description">
                    <Controller
                      control={form.control}
                      name="meta_description"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="SEO description"
                        />
                      )}
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Meta Keywords">
                    <Controller
                      control={form.control}
                      name="meta_keywords"
                      render={({ field }) => (
                        <Input {...field} placeholder="keyword1, keyword2" />
                      )}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
