import { Controller } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import DisplayFormDrawer from "@/components/common/DisplayFormDrawer"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useRejectForm } from "./useRejectForm"
import { FieldGroup, FieldSet } from "@/components/ui/field"

const RejectForm = () => {
  const { form, onSubmit, isLoading, handleClose, open } = useRejectForm()

  return (
    <DisplayFormDrawer
      onSubmit={form.handleSubmit(onSubmit)}
      onClose={handleClose}
      isLoading={isLoading}
      open={open}
      title="Reject Payment"
      description="Provide a reason for rejecting this payment."
    >
      <form>
        <FieldSet>
          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="Rejection Reason"
              required
              error={form.formState.errors.rejection_reason?.message}
            >
              <Controller
                control={form.control}
                name="rejection_reason"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="e.g. The transaction reference could not be verified"
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

export default RejectForm
