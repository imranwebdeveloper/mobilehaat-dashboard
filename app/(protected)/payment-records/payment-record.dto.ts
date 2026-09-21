import z from "zod"

export const paymentRejectSchema = () => {
  return z.object({
    rejection_reason: z
      .string()
      .min(1, "Rejection reason is required")
      .max(300, "Rejection reason cannot exceed 300 characters"),
  })
}

export type PaymentRejectValues = z.input<
  ReturnType<typeof paymentRejectSchema>
>

export const paymentUpdateSchema = () => {
  return z.object({
    payment_method: z.string().min(1, "Payment method is required"),
    amount: z.coerce
      .number()
      .min(0, "Amount must be at least 0")
      .optional()
      .or(z.nan())
      .transform((v) => (Number.isNaN(v) ? undefined : v)),
    transaction_reference: z
      .string()
      .max(200, "Transaction reference cannot exceed 200 characters")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
  })
}

export type PaymentUpdateValues = z.input<
  ReturnType<typeof paymentUpdateSchema>
>
