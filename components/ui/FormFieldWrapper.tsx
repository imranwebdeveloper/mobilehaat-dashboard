import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
const FormFieldWrapper = ({
  label,
  required,
  error,
  children,
  className = "",
  orientation = "vertical",
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal" | "responsive" | null
}) => (
  <Field className={className} orientation={orientation}>
    <FieldLabel required={required}>{label}</FieldLabel>
    {children}
    {error && (
      <FieldDescription className="text-red-500">{error}</FieldDescription>
    )}
  </Field>
)

export default FormFieldWrapper
