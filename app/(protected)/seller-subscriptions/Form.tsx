import { useState } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useCustomForm } from "./useCustomForm"
import { useModalContext } from "@/hooks/useModalContext"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SubscriptionPeriod } from "./seller-subscription.type"
import {
  AsyncSingleSelect,
  SelectOption,
} from "@/components/common/select/AsyncSelect"
import { ChartColumnBig } from "lucide-react"

export default function Form() {
  const { form, onSubmit, isLoading, isFetching, handleClose, open } =
    useCustomForm()
  const { action } = useModalContext()

  const [seller, setSeller] = useState<SelectOption | null>(null)
  const [plan, setPlan] = useState<SelectOption | null>(null)

  const [prevAction, setPrevAction] = useState(action)
  if (action !== prevAction) {
    setPrevAction(action)
    setSeller(null)
    setPlan(null)
  }

  return (
    <DisplayFormDrawer
      onSubmit={form.handleSubmit(onSubmit)}
      onClose={handleClose}
      isLoading={isLoading}
      open={open}
      title="Assign Seller Plan"
      description="Assign a subscription plan to a seller."
    >
      <form>
        <FieldSet>
          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="Seller"
              required
              error={form.formState.errors.seller_id?.message}
            >
              <AsyncSingleSelect
                url="/admin/sellers"
                labelField="store_name"
                valueField="_id"
                searchField="store_name"
                placeholder="Search seller by store name"
                value={seller}
                onChange={(value) => {
                  setSeller(value)
                  form.setValue("seller_id", value?.value || "")
                }}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Plan"
              required
              error={form.formState.errors.plan_id?.message}
            >
              <AsyncSingleSelect
                url="/seller-plans"
                labelField="name"
                valueField="_id"
                searchField="name"
                placeholder="Select a plan"
                value={plan}
                onChange={(value) => {
                  setPlan(value)
                  form.setValue("plan_id", value?.value || "")
                }}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Billing Period"
              required
              error={form.formState.errors.period?.message}
            >
              <Controller
                control={form.control}
                name="period"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubscriptionPeriod.MONTHLY}>
                        Monthly
                      </SelectItem>
                      <SelectItem value={SubscriptionPeriod.QUARTERLY}>
                        Quarterly (3 months)
                      </SelectItem>
                      <SelectItem value={SubscriptionPeriod.HALF_YEARLY}>
                        Half Yearly (6 months)
                      </SelectItem>
                      <SelectItem value={SubscriptionPeriod.YEARLY}>
                        Yearly (12 months)
                      </SelectItem>
                      <SelectItem value={SubscriptionPeriod.CUSTOM}>
                        Custom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormFieldWrapper>

            {form.watch("period") === SubscriptionPeriod.CUSTOM && (
              <FormFieldWrapper
                label="Duration (months)"
                required
                error={form.formState.errors.duration_months?.message}
              >
                <Controller
                  control={form.control}
                  name="duration_months"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={24}
                      placeholder="e.g. 2"
                      value={field.value as number}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </FormFieldWrapper>
            )}

            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
              <ChartColumnBig className="h-4 w-4" />
              {isFetching
                ? "Loading plan pricing..."
                : "Price is calculated from the plan's monthly price × duration."}
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </DisplayFormDrawer>
  )
}
