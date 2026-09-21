import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SellerPlanStatus, SellerPlanCurrency } from "./seller-plan.type"
import { Checkbox } from "@/components/ui/checkbox"
import CreateAbleMultiSelect from "@/components/common/select/CreateAbleMultiSelect"
import {
  convertStringArrayToSelectOption,
  convertSelectOptionToStringArray,
} from "@/lib/select"

const FeatureCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean | undefined
  onChange: (value: boolean) => void
}) => {
  return (
    <div className="flex items-center gap-2 py-2">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <label className="text-sm font-medium">{label}</label>
    </div>
  )
}

export default function Form() {
  const { form, onSubmit, isLoading, isEdit, handleClose, open } =
    useCustomForm()

  return (
    <DisplayFormDrawer
      onSubmit={form.handleSubmit(onSubmit)}
      onClose={handleClose}
      isLoading={isLoading}
      open={open}
      title={isEdit ? "Edit Seller Plan" : "Create Seller Plan"}
      description={
        isEdit
          ? "Update seller plan information."
          : "Fill in the form below to create a new seller plan."
      }
    >
      <form>
        <FieldSet>
          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="Name"
              required
              error={form.formState.errors.name?.message}
            >
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input {...field} placeholder="Plan name (e.g. Standard)" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Slug"
              error={form.formState.errors.slug?.message}
            >
              <Controller
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <Input {...field} placeholder="plan-slug (optional)" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Short description of the plan"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Features"
              error={form.formState.errors.features?.message}
            >
              <Controller
                control={form.control}
                name="features"
                render={({ field }) => (
                  <CreateAbleMultiSelect
                    value={convertStringArrayToSelectOption(field.value)}
                    onChange={(event) => {
                      field.onChange(convertSelectOptionToStringArray(event))
                    }}
                    placeholder="Type a feature and press Enter to add"
                  />
                )}
              />
            </FormFieldWrapper>

            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Monthly Price"
                required
                error={form.formState.errors.monthly_price?.message}
              >
                <Controller
                  control={form.control}
                  name="monthly_price"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="e.g. 499"
                      value={field.value as number}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Currency"
                required
                error={form.formState.errors.currency?.message}
              >
                <Controller
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SellerPlanCurrency.BDT}>
                          BDT (৳)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Max Active Offers"
              required
              error={form.formState.errors.max_active_offers?.message}
            >
              <Controller
                control={form.control}
                name="max_active_offers"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="e.g. 50"
                    value={field.value as number}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Sort Order"
              error={form.formState.errors.sort_order?.message}
            >
              <Controller
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Display order (e.g. 1, 2, 3)"
                    value={field.value as number}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormFieldWrapper>

            <div className="grid gap-2 rounded-md border p-3 md:grid-cols-2">
              <Controller
                control={form.control}
                name="featured_listing"
                render={({ field }) => (
                  <FeatureCheckbox
                    label="Featured Listing"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="priority_listing"
                render={({ field }) => (
                  <FeatureCheckbox
                    label="Priority Listing"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="analytics"
                render={({ field }) => (
                  <FeatureCheckbox
                    label="Analytics"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="verified_badge"
                render={({ field }) => (
                  <FeatureCheckbox
                    label="Verified Badge"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <Controller
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label className="text-sm font-medium">Default Plan</label>
            </div>

            <div className="grid gap-1 py-2 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="is_paid"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label className="text-sm font-medium">Paid Plan</label>
              </div>
              <p className="text-xs text-muted-foreground">
                Paid plans create a VERIFIED payment record when a seller plan
                is assigned.
              </p>
            </div>

            <FormFieldWrapper
              label="Status"
              error={form.formState.errors.status?.message}
              required
            >
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SellerPlanStatus.ACTIVE}>
                        Active
                      </SelectItem>
                      <SelectItem value={SellerPlanStatus.INACTIVE}>
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormFieldWrapper>
          </FieldGroup>
        </FieldSet>
      </form>
    </DisplayFormDrawer>
  )
}
