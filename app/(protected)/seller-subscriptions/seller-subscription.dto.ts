import z from "zod"
import { SubscriptionPeriod } from "./seller-subscription.type"

export const subscriptionAssignSchema = () => {
  return z.object({
    seller_id: z.string().min(1, "Seller is required"),
    plan_id: z.string().min(1, "Plan is required"),
    period: z
      .nativeEnum(SubscriptionPeriod)
      .default(SubscriptionPeriod.MONTHLY),
    duration_months: z.coerce
      .number()
      .min(1, "Duration must be at least 1 month")
      .max(24, "Duration cannot exceed 24 months")
      .default(1),
  })
}

export type SubscriptionAssignValues = z.input<
  ReturnType<typeof subscriptionAssignSchema>
>
