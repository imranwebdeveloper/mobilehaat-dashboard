import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useUpdateForm } from "./useUpdateForm"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { PaymentMethod } from "./payment-record.type"

const UpdateForm = () => {
  const { form, onSubmit, isLoading, handleClose, open } = useUpdateForm()

  return (
    <DisplayFormDrawer
      onSubmit={form.handleSubmit(onSubmit)}
      onClose={handleClose}
      isLoading={isLoading}
      open={open}
      title="Update Payment Record"
      description="Edit payment method, amount or transaction reference."
    >
      <form>
        <FieldSet>
          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="Payment Method"
              required
              error={form.formState.errors.payment_method?.message}
            >
              <Controller
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.BKASH}>bKash</SelectItem>
                      <SelectItem value={PaymentMethod.NAGAD}>Nagad</SelectItem>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Amount"
              error={form.formState.errors.amount?.message}
            >
              <Controller
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? NaN : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Transaction Reference"
              error={form.formState.errors.transaction_reference?.message}
            >
              <Controller
                control={form.control}
                name="transaction_reference"
                render={({ field }) => (
                  <Input
                    placeholder="e.g. TXN-123456"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormFieldWrapper>
          </FieldGroup>
        </FieldSet>
      </form>
    </DisplayFormDrawer>
  )
}

export default UpdateForm
