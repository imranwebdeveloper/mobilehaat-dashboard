import z from "zod"
import { SellerPlanStatus, SellerPlanCurrency } from "./seller-plan.type"

export const sellerPlanSchema = () => {
  return z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional().default([]),
    monthly_price: z.coerce.number().min(0, "Price must be 0 or more"),
    is_paid: z.boolean().default(false),
    currency: z.nativeEnum(SellerPlanCurrency).default(SellerPlanCurrency.BDT),
    max_active_offers: z.coerce.number().min(0, "Must be 0 or more"),
    featured_listing: z.boolean().default(false),
    priority_listing: z.boolean().default(false),
    analytics: z.boolean().default(false),
    verified_badge: z.boolean().default(false),
    sort_order: z.coerce.number().default(0),
    is_default: z.boolean().default(false),
    status: z.nativeEnum(SellerPlanStatus).default(SellerPlanStatus.ACTIVE),
  })
}

export type SellerPlanFormValues = z.input<ReturnType<typeof sellerPlanSchema>>
